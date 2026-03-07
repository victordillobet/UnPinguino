<?php
/**
 * UnPinguino Calendar Cache Proxy
 * Fetches Google Calendar ICS and caches it locally for 10 minutes.
 */

// --- CONFIGURATION ---
// IMPORTANT: Replace this with your Google Calendar "Secret address in iCal format" or "Public address in iCal format"
$google_calendar_url = "https://calendar.google.com/calendar/ical/afd4a45ddf7237cfa9bdfbe06cefbeeb8f54bab7a27f8a842c3d89a4d2f2d262%40group.calendar.google.com/private-8c1c56736ec755b84cbae4611ebc0201/basic.ics";

$cache_file = "calendar_cache.ics";
$cache_time = 600; // 10 minutes in seconds

// --- LOGIC ---
header('Content-Type: text/calendar; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Check if cache exists and is fresh
if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_time)) {
    echo file_get_contents($cache_file);
    exit;
}

// Function to fetch data robustly
function fetch_url($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'UnPinguinoCalendarBot/1.0');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    } else {
        $context = stream_context_create([
            "http" => ["header" => "User-Agent: UnPinguinoCalendarBot/1.0\r\n"]
        ]);
        return @file_get_contents($url, false, $context);
    }
}

$data = fetch_url($google_calendar_url);

if ($data && strpos($data, 'BEGIN:VCALENDAR') !== false) {
    // Save to local cache
    file_put_contents($cache_file, $data);
    echo $data;
} else if (file_exists($cache_file)) {
    // Fallback to old cache
    echo file_get_contents($cache_file);
} else {
    http_response_code(503);
    echo "Error: No se pudo obtener el calendario. Verifica la URL en cache_calendar.php.";
}
?>
