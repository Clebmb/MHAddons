export async function headProbe(url, headers, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: "HEAD",
            headers,
            redirect: "follow",
            signal: controller.signal
        });
        return response.ok;
    }
    catch {
        return false;
    }
    finally {
        clearTimeout(timeout);
    }
}
