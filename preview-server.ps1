#requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Root,
    [ValidateRange(1024, 65535)][int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath (Join-Path $Root 'index.html') -PathType Leaf)) {
    throw 'Preview root must contain index.html.'
}

# Use the .NET TCP listener rather than HTTP.sys; no URL reservation or admin rights.
# This C# code uses APIs and syntax available in Windows PowerShell 5.1 / .NET 4.x.
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public static class CjytdStaticPreview
{
    private static string rootDirectory;
    private static string rootPrefix;

    public static void Run(string root, int port)
    {
        rootDirectory = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        rootPrefix = rootDirectory.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;
        TcpListener listener = new TcpListener(IPAddress.Loopback, port);
        listener.ExclusiveAddressUse = true;
        listener.Start();
        int workerThreads, completionThreads;
        ThreadPool.GetMinThreads(out workerThreads, out completionThreads);
        ThreadPool.SetMinThreads(Math.Max(workerThreads, 32), completionThreads);
        Console.WriteLine("CJYTD preview listening on http://127.0.0.1:" + port + "/");
        try
        {
            while (true)
            {
                TcpClient client = listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(Serve, client);
            }
        }
        finally { listener.Stop(); }
    }

    private static void Headers(Stream stream, int status, string reason, string mime, long length, string extra)
    {
        string text = "HTTP/1.1 " + status + " " + reason + "\r\n" +
            "Content-Type: " + mime + "\r\nContent-Length: " + length + "\r\n" +
            "Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n" + extra + "\r\n";
        byte[] bytes = Encoding.ASCII.GetBytes(text);
        stream.Write(bytes, 0, bytes.Length);
    }

    private static void Error(Stream stream, int status, string reason, bool head)
    {
        byte[] body = Encoding.UTF8.GetBytes(status + " " + reason + "\n");
        Headers(stream, status, reason, "text/plain; charset=utf-8", body.Length, status == 405 ? "Allow: GET, HEAD\r\n" : "");
        if (!head) { stream.Write(body, 0, body.Length); }
        stream.Flush();
    }

    private static string Mime(string path)
    {
        switch (Path.GetExtension(path).ToLowerInvariant())
        {
            case ".html": case ".htm": return "text/html; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".js": case ".mjs": return "application/javascript; charset=utf-8";
            case ".json": return "application/json; charset=utf-8";
            case ".svg": return "image/svg+xml";
            case ".jpg": case ".jpeg": return "image/jpeg";
            case ".png": return "image/png";
            case ".webp": return "image/webp";
            case ".gif": return "image/gif";
            case ".ico": return "image/x-icon";
            case ".woff": return "font/woff";
            case ".woff2": return "font/woff2";
            case ".pdf": return "application/pdf";
            default: return "application/octet-stream";
        }
    }

    private static void Serve(object state)
    {
        using (TcpClient client = (TcpClient)state)
        {
            client.ReceiveTimeout = 5000;
            client.SendTimeout = 15000;
            try
            {
                using (Stream stream = new BufferedStream(client.GetStream(), 8192))
                {
                    byte[] buffer = new byte[16384];
                    int count = 0;
                    while (true)
                    {
                        int next = stream.ReadByte();
                        if (next < 0) { return; }
                        buffer[count++] = (byte)next;
                        if (count >= 4 && buffer[count - 4] == 13 && buffer[count - 3] == 10 && buffer[count - 2] == 13 && buffer[count - 1] == 10) { break; }
                        if (count == buffer.Length) { Error(stream, 431, "Request Header Fields Too Large", false); return; }
                    }
                    string firstLine = Encoding.ASCII.GetString(buffer, 0, count).Split(new string[] { "\r\n" }, StringSplitOptions.None)[0];
                    string[] request = firstLine.Split(' ');
                    if (request.Length != 3 || !request[2].StartsWith("HTTP/1.", StringComparison.Ordinal)) { Error(stream, 400, "Bad Request", false); return; }
                    bool head = request[0] == "HEAD";
                    if (request[0] != "GET" && !head) { Error(stream, 405, "Method Not Allowed", false); return; }

                    string target = request[1].Split('?')[0];
                    if (!target.StartsWith("/", StringComparison.Ordinal)) { Error(stream, 400, "Bad Request", head); return; }
                    string decoded = Uri.UnescapeDataString(target);
                    if (decoded.IndexOfAny(new char[] { '\0', '\\', ':' }) >= 0) { Error(stream, 403, "Forbidden", head); return; }
                    string relative = decoded.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                    string path = Path.GetFullPath(Path.Combine(rootDirectory, relative));
                    if (Directory.Exists(path)) { path = Path.Combine(path, "index.html"); }
                    if (!path.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase)) { Error(stream, 403, "Forbidden", head); return; }
                    if (!File.Exists(path)) { Error(stream, 404, "Not Found", head); return; }
                    // Reject links/junctions so the preview cannot escape the public dist directory.
                    string part = path;
                    while (!String.Equals(part, rootDirectory, StringComparison.OrdinalIgnoreCase))
                    {
                        if ((File.GetAttributes(part) & FileAttributes.ReparsePoint) != 0) { Error(stream, 403, "Forbidden", head); return; }
                        part = Path.GetDirectoryName(part);
                    }
                    using (FileStream file = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
                    {
                        Headers(stream, 200, "OK", Mime(path), file.Length, "");
                        if (!head) { file.CopyTo(stream); }
                    }
                    stream.Flush();
                }
            }
            catch (IOException) { /* Browser disconnected or the file changed during a request. */ }
            catch (SocketException) { /* Browser closed an idle connection. */ }
            catch (Exception error) { Console.Error.WriteLine(error.GetType().Name + ": " + error.Message); }
        }
    }
}
'@

[CjytdStaticPreview]::Run([System.IO.Path]::GetFullPath($Root), $Port)
