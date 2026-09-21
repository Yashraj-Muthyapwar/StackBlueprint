import { type LessonContent } from "@/lessons/types";
import howWebWorksImg from "@/images/web-scraping/foundations/how-web-works.png";
import httpMethodsImg from "@/images/web-scraping/foundations/http-methods.png";
import httpQueryMethodImg from "@/images/web-scraping/foundations/http-query-method.png";
import httpStatusCodesImg from "@/images/web-scraping/foundations/http-status-codes.png";
import httpHeadersCookiesImg from "@/images/web-scraping/foundations/http-headers-cookies.png";
import htmlDOMImg from "@/images/web-scraping/foundations/html-DOM.png";
import devToolsImg from "@/images/web-scraping/foundations/developer-tools.png";
import renderingLadderImg from "@/images/web-scraping/foundations/client-side-server-side.png";

export type WebScrapingFoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: string;
  lessons: LessonContent[];
};

const howTheWebWorks: LessonContent = {
  slug: "how-the-web-works",
  title: "How the Web Works",
  subtitle: "How a URL becomes a response and where your scraper fits in.",
  sections: [
    {
      kind: "prose",
      body: [
        "Before we extract data from websites, we need one reliable mental model: a browser does not visit a page like a person visits a room. It sends a request to a service, receives a response, and turns that response into something you can see and use.",
        "That same request-response cycle powers every scraper in this course. The difference is that, instead of asking a browser to do the work for us, we will often make the request directly in Python and keep only the data we need.",
      ],
    },
    {
      kind: "analogy",
      title: "The Restaurant Analogy",
      text: "Think of a website as a restaurant. You are the client. You choose an item from the menu and give the waiter a precise order: that is the request. The kitchen is the server: it receives the order, prepares the result, and sends it back as the response. A scraper is a program that places those orders automatically and records the useful parts of what comes back. The important detail: the kitchen can only respond to the information in the order it receives.",
    },
    {
      kind: "prose",
      heading: "Clients, Servers, and HTTP",
      body: [
        "Your browser is a client. A web service is a server. When you enter a URL, the client sends an HTTP request to the server and the server returns an HTTP response. The request describes what you want; the response contains a status code, headers, and usually a body.",
        "For example, requesting a page with GET might return 200 OK and an HTML document. A missing page might return 404. A server asking you to slow down might return 429. We will work with those responses throughout this track.",
      ],
    },
    {
      kind: "image",
      src: howWebWorksImg,
      alt: "The request-response cycle behind a page load.",
      caption: "The request-response cycle behind a page load.",
    },
    {
      kind: "prose",
      heading: "What happens before the request",
      body: [
        "The HTTP request is the visible part of a longer trip. First, DNS translates a human-friendly hostname such as example.com into an IP address. Next, your computer opens a network connection to that address. For HTTPS sites, it then performs a TLS handshake to encrypt the connection and verify the server certificate.",
        "Only after those steps can HTTP begin. This is why a slow request is not always a slow website: the delay may come from name lookup, network distance, encryption setup, server work, or downloading the response.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "A browser page is usually many requests",
      body: "The first HTML response is often a starting point, not the entire page. A browser may then fetch CSS, JavaScript, images, fonts, and JSON data from APIs. requests.get(url) makes one request; it does not automatically run JavaScript or fetch everything the browser discovers afterward.",
    },
    {
      kind: "prose",
      heading: "The Anatomy of a URL",
      body: [
        "A URL is not just an address; it is a set of instructions. It usually consists of a **scheme** (like `https://`), a **host** (`en.wikipedia.org`), a **path** (`/w/index.php`), and sometimes a **query** string (`?title=Web_scraping`).",
        "It can also include a **fragment** (`#Legal_issues`) at the very end. The fragment is used by the browser to scroll to a specific part of the page or manage state, but here is the crucial detail for scraping: the fragment is never sent to the server. If a page loads different data based on the fragment, it is happening entirely in the browser via JavaScript.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Deconstructing a URL",
      code: `from urllib.parse import urlparse, parse_qs

url = "https://en.wikipedia.org/w/index.php?title=Web_scraping&oldid=1173934305#Legal_issues"
parsed = urlparse(url)

print(parsed.scheme)   # https
print(parsed.netloc)   # en.wikipedia.org
print(parsed.path)     # /w/index.php
print(parsed.query)    # title=Web_scraping&oldid=1173934305
print(parsed.fragment) # Legal_issues

print(parse_qs(parsed.query))
# {'title': ['Web_scraping'], 'oldid': ['1173934305']}`,
    },
    {
      kind: "prose",
      heading: "Where scraping fits in",
      body: [
        "For a static site, the useful data may already be in the HTML response. In that case, a normal HTTP client such as requests is fast, simple, and usually the right tool. Your code requests the HTML, parses it, and extracts the fields you care about.",
        "For a JavaScript-heavy site, the initial HTML can be mostly an empty shell. The browser may request the actual data from a JSON API after the page loads. Later in this course, you will learn how to find and reproduce that API request and when browser automation with Playwright is the better choice.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Make one HTTP request and inspect the response",
      code: `import requests

url = "https://en.wikipedia.org/wiki/Web_scraping"

# Act as the client. timeout keeps a broken connection from waiting forever.
response = requests.get(url, timeout=10)

# Stop early if the server returned an error such as 404 or 500.
response.raise_for_status()

print(response.status_code)                 # 200
print(response.headers.get("content-type")) # text/html; charset=UTF-8
print(response.text[:100])                  # <!DOCTYPE html>\\n<html class="client-nojs"...`,
    },
    {
      kind: "prose",
      heading: "One request, not a disguised browser",
      body: [
        "A scraper is not invisible just because it uses Python. Websites can examine the request's headers, cookies, IP reputation, timing, and TLS fingerprint. They can often distinguish a browser from a script, and they may enforce rate limits or access rules accordingly.",
        "Our goal is not to imitate every part of a browser by default. It is to make the smallest, clearest request that returns data we are allowed to collect and then handle the result responsibly.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Scraping vs APIs",
      body: "Wikipedia offers an API, and in a real project you would prefer it over scraping HTML. We are scraping the HTML here because the mechanics are what we are learning.",
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the example against a simple site. Look at the status code, content type, and first few characters of the response. Then open the same URL in your browser, open DevTools -> Network, and reload the page.",
        "Notice the difference: your script made one request, while the browser likely made several. In later lessons, that Network panel will help you find exactly where a site gets its data.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "The web uses a client-server model: clients send requests and servers return responses.",
        "Before HTTP begins, DNS, a network connection, and usually TLS must succeed.",
        "An HTTP response includes a status code, headers, and a body such as HTML or JSON.",
        "One browser page load can involve many requests; one requests.get call makes only one.",
        "Start with the simplest allowed request that gives you the data you need.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "how-the-web-works-requests",
          question:
            "How does `requests.get()` behave compared to a normal web browser opening a page?",
          options: [
            "It automatically downloads all images and CSS files.",
            "It executes JavaScript exactly like a browser.",
            "It makes exactly one HTTP request and returns the raw response.",
            "It hides your identity from the server.",
          ],
          correctIndex: 2,
          explanation:
            "A single `requests.get()` fetches exactly what you ask for and nothing more. It doesn't parse the HTML to discover and download extra assets or run JS.",
        },
        {
          id: "how-the-web-works-fragment",
          question:
            "In the URL `https://example.com/products?sort=price#reviews`, what does the server do with the `#reviews` fragment?",
          options: [
            "It uses it to filter the database query.",
            "It ignores it because fragments are never sent to the server.",
            "It redirects the user to the reviews page.",
            "It returns JSON instead of HTML.",
          ],
          correctIndex: 1,
          explanation:
            "The fragment is handled entirely client-side by the browser. The server only sees the path and the query string.",
        },
        {
          id: "how-the-web-works-detection",
          question: "Why should we avoid thinking our scraper is 'invisible' to the website?",
          options: [
            "Because Python is slower than JavaScript.",
            "Because websites can examine request headers, TLS fingerprints, and behavior to distinguish a script from a real browser.",
            "Because scrapers cannot connect over HTTPS.",
            "Because every scraping request requires an API key.",
          ],
          correctIndex: 1,
          explanation:
            "Servers look at details like User-Agent headers, IP reputation, and TLS fingerprints. A generic python script looks very different from Chrome.",
        },
      ],
    },
  ],
};

const httpMethods: LessonContent = {
  slug: "http-methods-and-status-codes",
  title: "HTTP Methods & Status Codes",
  subtitle: "GET vs POST, and what 200, 404, and 500 actually mean.",
  sections: [
    {
      kind: "prose",
      heading: "Methods: What do you want to do?",
      body: [
        "If a URL identifies what you are looking for, the HTTP method tells the server what you actually want to do with it. Let's look at the most common methods you will use in web scraping.",
        "**GET:** This is the standard read request. It asks the server to return the resource without changing any data on the server itself. Most page loads and API fetches you make will be GET requests.",
        "**POST:** You use this to send data to the server to be processed, like submitting a login form or running a complex search. POST requests contain a body that holds the data payload.",
        "**HEAD:** This asks for the exact same response as a GET, but without downloading the response body. It is extremely useful when you just want to check if a file exists or read its size (via the Content-Length header) without wasting bandwidth.",
      ],
    },
    {
      kind: "image",
      src: httpMethodsImg,
      alt: "Common HTTP Methods",
      caption: "Common HTTP Methods used in web scraping.",
    },
    {
      kind: "prose",
      heading: "The emerging QUERY method",
      body: [
        "Historically, if you wanted to fetch data using a complex, deeply nested query, you ran into a problem. GET requests are not supposed to have a body, and many servers simply ignore it if you try. Putting massive queries in the URL string is messy and often hits length limits. POST allows a body, but it is technically meant for modifying data, not for safe, read-only queries.",
        "To solve this exact issue, the IETF is standardizing a new **QUERY** method. It acts exactly like a GET, meaning it is safe, idempotent, and cacheable. However, it allows you to send your query payload in the request body. As APIs modernize, you will start seeing this method used to fetch data without resorting to POST.",
      ],
    },
    {
      kind: "image",
      src: httpQueryMethodImg,
      alt: "The HTTP QUERY Method",
      caption:
        "The HTTP QUERY Method allows a request body like POST but remains safe and idempotent like GET.",
    },
    {
      kind: "prose",
      heading: "Status Codes: What happened?",
      body: [
        "Every HTTP response includes a three-digit status code. The first digit is the most important one because it defines the broad category of the result.",
        "**2xx (Success):** The server successfully processed your request. **200 OK** is the standard success code you will see most often. **201 Created** means a resource was successfully made on the server.",
        "**3xx (Redirection):** The resource has moved, and the server is telling you where to go next. **301 Moved Permanently** means the URL has changed for good, while **302 Found** is just a temporary redirect. **304 Not Modified** tells you that your cached copy is still perfectly fresh.",
        "**4xx (Client Error):** You made a mistake. **400 Bad Request** means your syntax is invalid. **401 Unauthorized** means you need to log in first. **403 Forbidden** means you lack permission (or your scraper was detected and blocked!). **404 Not Found** means the resource does not exist. **429 Too Many Requests** means you have hit a rate limit and need to slow down.",
        "**5xx (Server Error):** The server failed to fulfill a perfectly valid request. **500 Internal Server Error** is a generic backend crash. **502 Bad Gateway** often means a proxy or load balancer failed to reach the main application. **503 Service Unavailable** means the server is overloaded or down for maintenance.",
      ],
    },
    {
      kind: "image",
      src: httpStatusCodesImg,
      alt: "HTTP Status Codes",
      caption: "The main categories of HTTP Status Codes.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "200 OK does not mean 'Success'",
      body: "A server might return a 200 OK status code, but the body of the response could be a captcha, a login page, or a generic 'Item not found' message wrapped in standard HTML. Always validate the content type and look for a specific marker in the HTML to confirm you received the data you expected.",
    },
    {
      kind: "prose",
      heading: "Following Redirects",
      body: [
        "By default, the requests library will automatically follow 3xx redirects for you. This is usually what you want, but it can mask problems. If a product page is removed, the server might redirect you to the home page with a 200 OK.",
        "You can check if a redirect occurred by inspecting response.history. You can also disable automatic redirects by setting allow_redirects=False. This lets you inspect the raw 3xx response and the 'Location' header to see exactly where the server is trying to send you.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Inspecting redirects manually",
      code: `import requests

url = "http://github.com" # HTTP instead of HTTPS

# requests follows redirects automatically by default
response = requests.get(url)
print(response.url)     # https://github.com/
print(response.history) # [<Response [301]>]

# To inspect the redirect itself, disable automatic following
raw = requests.get(url, allow_redirects=False)
print(raw.status_code, raw.headers.get("location"))`,
    },
    {
      kind: "prose",
      heading: "Retrying, carefully",
      body: [
        "Over thousands of requests, some will fail for reasons unrelated to your code: a dropped connection, a server restart, or a brief load-balancer problem. Retries help with those temporary failures.",
        "Retry the right things. Network timeouts and selected 5xx responses are reasonable to try again with exponential backoff. For 429, wait as long as the server asks. For 403, do not blindly retry: stop and inspect whether the site requires authentication, has blocked access, or does not permit the request.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "A retry loop that knows when to stop",
      code: `from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import random
import time

import requests

RETRYABLE = {408, 500, 502, 503, 504}


def retry_after_seconds(response, default=60):
    """Read Retry-After as either seconds or an HTTP date."""
    value = response.headers.get("retry-after")
    if not value:
        return default

    try:
        return max(0, float(value))
    except ValueError:
        try:
            retry_at = parsedate_to_datetime(value)
            if retry_at.tzinfo is None:
                retry_at = retry_at.replace(tzinfo=timezone.utc)
            return max(0, (retry_at - datetime.now(timezone.utc)).total_seconds())
        except (TypeError, ValueError, IndexError, OverflowError):
            return default


def backoff_delay(attempt):
    # Exponential backoff plus jitter prevents parallel workers from retrying
    # together at the exact same moment.
    return min(2 ** attempt + random.uniform(0, 1), 60)


def get_with_retry(url, attempts=4, default_retry_after=60):
    for attempt in range(attempts):
        try:
            response = requests.get(url, timeout=(5, 20))
        except (requests.Timeout, requests.ConnectionError):
            if attempt == attempts - 1:
                break
            time.sleep(backoff_delay(attempt))
            continue

        if response.status_code == 200:
            return response

        if response.status_code == 403:
            print("forbidden: stopping to inspect the cause")
            return None

        if response.status_code == 429:
            if attempt == attempts - 1:
                break
            wait = retry_after_seconds(response, default=default_retry_after)
            print(f"rate limited; waiting {wait:.0f}s")
            time.sleep(wait)
            continue

        if response.status_code in RETRYABLE:
            if attempt == attempts - 1:
                break
            time.sleep(backoff_delay(attempt))
            continue

        print(f"skipping {url}: status {response.status_code}")
        return None

    print(f"gave up on {url} after {attempts} attempts")
    return None`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why add randomness?",
      body: "The small random delay is called jitter. Without it, requests that fail together often retry together too, creating another spike of traffic. Jitter spreads those retries out.",
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "httpbin.org can return a chosen status code, making it useful for testing response handling. Try get_with_retry against /status/200, /status/404, /status/503, and /status/403. To avoid a long wait while testing 429 without a Retry-After header, use attempts=1 or set default_retry_after=0.",
        "Then request /redirect/3 and inspect response.history. You should see three redirect hops, a final 200 response, and a response.url that differs from the URL you requested.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "The URL identifies a resource; the HTTP method communicates your intended action.",
        "GET is the standard safe read request. HEAD returns metadata without a response body when the server supports it.",
        "Status-code families tell you what happened: 2xx succeeded, 3xx redirects or validates a cache, 4xx was rejected, and 5xx failed on the server.",
        "A 200 is not proof that you got the right content. Validate type, content, and a target-specific marker.",
        "Retry temporary network failures and selected 5xx responses with backoff and jitter. Respect 429 and inspect 403 rather than blindly repeating it.",
        "Check response.url and response.history when the data looks wrong. Redirects can hide a missing page.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "http-methods-200-ok",
          question:
            "If a server returns a 200 OK status code, does this guarantee that you received the data you wanted?",
          options: [
            "Yes, 200 OK means the page loaded perfectly.",
            "Yes, unless the Content-Type is missing.",
            "No, the server might return a 200 OK for a captcha, login page, or soft error page.",
            "No, 200 OK actually means the request was rate-limited.",
          ],
          correctIndex: 2,
          explanation:
            "Websites often return 200 OK even when displaying an error message or a captcha. You must validate the actual content to be sure.",
        },
        {
          id: "http-methods-retrying",
          question: "Which of the following status codes should you NOT blindly retry?",
          options: [
            "408 Request Timeout",
            "502 Bad Gateway",
            "503 Service Unavailable",
            "403 Forbidden",
          ],
          correctIndex: 3,
          explanation:
            "A 403 Forbidden means the server understands your request but refuses to authorize it. Retrying will not help and may get your IP banned.",
        },
        {
          id: "http-methods-jitter",
          question: "What is the purpose of adding 'jitter' to an exponential backoff retry loop?",
          options: [
            "To make the code look more complex.",
            "To prevent multiple failed requests from retrying at the exact same time and causing a traffic spike.",
            "To bypass Cloudflare protection.",
            "To wait exactly 60 seconds before retrying.",
          ],
          correctIndex: 1,
          explanation:
            "Jitter adds a small amount of randomness to the delay, spreading out retries and avoiding a synchronized wave of requests hitting the server.",
        },
      ],
    },
  ],
};

const headersCookies: LessonContent = {
  slug: "headers-and-cookies",
  title: "Headers & Cookies",
  subtitle: "How state is maintained and how to mimic a real browser.",
  sections: [
    {
      kind: "prose",
      heading: "Headers: Providing Context",
      body: [
        "Headers are key-value pairs sent with every HTTP request and response. They provide essential context about the message being sent. For scrapers, request headers are your primary tool for convincing a server that you are a legitimate user.",
        "The most critical header is the User-Agent. It identifies your browser and operating system. A generic Python script often sends a default User-Agent like 'python-requests/2.31.0', which is an immediate red flag for most modern websites.",
        "Other important headers include Accept, which tells the server what kind of content you want (like HTML or JSON), and Accept-Language, which tells the server your preferred language.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Sending custom headers",
      code: `import requests

# A simple dictionary of headers to override the defaults
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

response = requests.get("https://httpbin.org/headers", headers=HEADERS)
print(response.json())`,
    },
    {
      kind: "prose",
      heading: "Conditional Requests",
      body: [
        "Sometimes you need to scrape a page repeatedly to check for updates. Instead of downloading the whole page every time, you can use headers to ask the server if anything has changed.",
        "If the server provides an ETag (a unique version identifier) or a Last-Modified date in its response, you can send those back in your next request using the If-None-Match or If-Modified-Since headers.",
        "If the content hasn't changed, the server will return a 304 Not Modified status code with no body. This saves you bandwidth and makes your scraper much faster and more polite.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Using ETags to avoid unnecessary downloads",
      code: `import requests

url = "https://api.github.com/repos/psf/requests"

# First request: get the data and save the ETag
response1 = requests.get(url)
etag = response1.headers.get("ETag")
print(response1.status_code) # 200

# Second request: send the ETag back
headers = {"If-None-Match": etag}
response2 = requests.get(url, headers=headers)

# The server confirms nothing changed and returns an empty body
print(response2.status_code) # 304`,
    },
    {
      kind: "prose",
      heading: "Cookies: Remembering State",
      body: [
        "HTTP does not remember a previous request on its own. A server needs an explicit way to connect your cart, login, or preferences to the next request you make.",
        "The server can send a Set-Cookie header. A client that stores it will return the appropriate cookie in later Cookie headers, subject to cookie rules such as domain, path, Secure, and expiry. That is how state can persist across separate HTTP requests.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Without a session, a cookie is not retained",
      code: `import requests

# This one-off request receives a cookie, then its temporary cookie jar is gone.
requests.get("https://httpbin.org/cookies/set/band/gold", timeout=10)

# A new request starts with a new cookie jar.
response = requests.get("https://httpbin.org/cookies", timeout=10)
print(response.json())  # {'cookies': {}}`,
    },
    {
      kind: "image",
      src: httpHeadersCookiesImg,
      alt: "A server issues a cookie and the client returns it on later requests.",
      caption: "A server issues a cookie and the client returns it on later requests.",
    },
    {
      kind: "prose",
      heading: "Sessions preserve state and can reuse connections",
      body: [
        "requests.Session keeps a cookie jar across its requests and gives you one place to set shared headers. It is a strong default when a scraper makes repeated requests to the same host or needs a stateful flow such as a permitted login.",
        "A Session also maintains a pool of reusable connections. When the server keeps a connection available, later requests can reuse it and avoid some setup work. This is an optimization, not a guarantee: servers can close connections and network timing still varies.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "A session retains cookies across requests",
      code: `import requests

with requests.Session() as session:
    session.headers.update({
        "User-Agent": "StackBlueprintBot/1.0 (+https://stackblueprint.com/bot)",
        "Accept-Language": "en-US,en;q=0.9",
    })

    session.get("https://httpbin.org/cookies/set/band/gold", timeout=10)

    response = session.get("https://httpbin.org/cookies", timeout=10)
    print(response.json())  # {'cookies': {'band': 'gold'}}`,
    },
    {
      kind: "code",
      language: "python",
      caption: "Compare separate requests with a session",
      code: `import time
import requests

URL = "https://quotes.toscrape.com/page/1/"
COUNT = 15

start = time.perf_counter()
for _ in range(COUNT):
    requests.get(URL, timeout=10)
separate_requests = time.perf_counter() - start

with requests.Session() as session:
    start = time.perf_counter()
    for _ in range(COUNT):
        session.get(URL, timeout=10)
    session_requests = time.perf_counter() - start

print(f"separate requests: {separate_requests:.2f}s")
print(f"one session:       {session_requests:.2f}s")
print(f"ratio:             {separate_requests / session_requests:.1f}x")

# This is a demonstration, not a benchmark. CDN caches, server behavior, and
# network conditions can make the difference small or large.`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not paste browser headers or cookies blindly",
      body: "Remove Host and Content-Length from copied requests because requests computes them. Avoid advertising compression you cannot decode. Never hardcode a copied Cookie header: values expire, may be scoped to a different domain, and can expose an authenticated session. Let a Session manage cookies where you have permission to use them.",
    },
    {
      kind: "prose",
      heading: "Cookie scope causes real bugs",
      body: [
        "Cookies are not global. Host-only cookies set by shop.example.com are sent back only to that host, not automatically to api.example.com. A cookie with Domain=example.com can apply to that domain and its subdomains. Path rules can narrow the scope further, and Secure cookies are sent only over HTTPS.",
        "This creates a familiar symptom: a permitted login works on the main site, but requests to a related API return 401. Before rewriting your authentication logic, inspect the cookie's domain, path, expiry, and Secure flag.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Inspect cookie scope and flags",
      code: `import requests

session = requests.Session()
session.get("https://httpbin.org/cookies/set/theme/dark", timeout=10)

for cookie in session.cookies:
    print(
        f"{cookie.name:16} domain={cookie.domain:26} "
        f"path={cookie.path:8} secure={cookie.secure} "
        f"expires={cookie.expires}"
    )`,
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the header inspection once with requests defaults and once with the small HEADERS dictionary. Compare what changes. Do not try to recreate every browser header; identify which specific response difference you are investigating.",
        "Then run the session comparison. Increase COUNT to fifty and observe the result, but treat it as a local experiment rather than a universal performance claim. Finally, run the ETag example and see whether the target server offers a validator.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Headers provide request context and response metadata; inspect them before changing them.",
        "A User-Agent, Accept, language preference, and compression support should be intentional, not copied wholesale from a browser.",
        "ETag and Last-Modified support conditional requests, which can return 304 without downloading an unchanged body.",
        "Cookies preserve state across requests, either as session identifiers or as client-held state.",
        "A requests.Session is a strong default for repeated requests to the same host: it retains cookies and may reuse connections.",
        "Cookies follow domain, path, Secure, and expiry rules; a login on one host may not apply to another.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "headers-cookies-session",
          question:
            "Why should you use a `requests.Session` when scraping multiple pages from the same website?",
          options: [
            "It runs the requests in parallel to speed up scraping.",
            "It automatically executes JavaScript on the pages you request.",
            "It persists cookies across requests and can reuse the underlying network connection.",
            "It automatically bypasses Cloudflare and other bot protections.",
          ],
          correctIndex: 2,
          explanation:
            "A Session acts like a continuous browsing session: it stores any cookies the server sets and sends them back on the next request, and connection pooling speeds up subsequent requests.",
        },
        {
          id: "headers-cookies-etag",
          question:
            "What is the primary benefit of using ETag or Last-Modified headers in your requests?",
          options: [
            "They prove to the server that you are a real human.",
            "They allow the server to return a 304 Not Modified without sending the full response body if the data hasn't changed.",
            "They force the server to always return the freshest data possible.",
            "They allow you to authenticate without a password.",
          ],
          correctIndex: 1,
          explanation:
            "Conditional requests save bandwidth. If the ETag matches what the server has, it returns 304 instead of sending the exact same payload again.",
        },
        {
          id: "headers-cookies-copy",
          question:
            "Why is it a bad idea to blindly copy all headers and cookies from your browser's network tab into your scraper script?",
          options: [
            "Because Python cannot handle headers that are too long.",
            "Because the server will know you are using Python if you send too many headers.",
            "Because cookies expire, some headers (like Content-Length) are automatically managed by requests, and copying authentication cookies can leak your personal session.",
            "Because copying headers is illegal.",
          ],
          correctIndex: 2,
          explanation:
            "Never hardcode cookies or dynamic headers. Let requests handle `Content-Length` and let a Session manage cookies dynamically.",
        },
      ],
    },
  ],
};

const theDom: LessonContent = {
  slug: "the-dom",
  title: "The Document Object Model (DOM)",
  subtitle: "How HTML becomes a tree structure that you can query.",
  sections: [
    {
      kind: "prose",
      heading: "Source vs Live DOM",
      body: [
        "HTML is just raw text sent by the server. A parser reads that text and turns it into a tree of elements called the DOM (Document Object Model).",
        "It is critical to understand the difference between the original source and the live DOM. 'View Page Source' in your browser shows the exact HTML text the server returned. The 'Elements' tab in Developer Tools shows the live DOM, which might have been modified by JavaScript after the page loaded.",
        "When scraping with a basic HTTP client like requests, you only get the original source text. If you write your scraper based on the DevTools Elements tab, it might fail because JavaScript hasn't run to create those elements yet.",
      ],
    },
    {
      kind: "image",
      src: htmlDOMImg,
      alt: "The HTML DOM Tree",
      caption: "HTML is parsed into a queryable tree structure called the DOM.",
    },
    {
      kind: "prose",
      heading: "Anchor, up, down",
      body: [
        "A robust scraping strategy is 'anchor, up, down'. Instead of trying to guess the exact path from the top of the document to your data, find a unique and stable anchor element.",
        "Walk UP the tree from that anchor to find the container holding a complete record (like a product card containing a title, price, and link). Then, walk DOWN into that container to extract the specific fields you need.",
        "When traversing children, remember that element children can include whitespace text nodes (like newlines between HTML tags). Always ask for direct element children (like tags) when structure matters.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Extracting text safely",
      code: `from bs4 import BeautifulSoup

html = '''
<div class="product">
  <h2>Super Widget</h2>
  <p class="description">A <strong>very</strong> good widget.</p>
</div>
'''
soup = BeautifulSoup(html, "lxml")

h2 = soup.find("h2")
# .string works when there is exactly one text node inside
print(h2.string)  # Super Widget

desc = soup.find("p", class_="description")
# .string returns None if there are child tags inside!
print(desc.string)  # None

# get_text() recursively extracts all text, letting you add a separator
print(desc.get_text(strip=True))  # A very good widget.
print(desc.get_text(separator=" ", strip=True))  # A very good widget.`,
    },
    {
      kind: "prose",
      heading: "The class attribute is special",
      body: [
        "The exception worth knowing in advance is class. HTML defines it as a space-separated set of names, so BeautifulSoup exposes it as a list. Comparing it directly with one string will be false even when the element clearly has that class.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Read attributes safely",
      code: `from bs4 import BeautifulSoup

html = '<article id="post-4021" class="card card--featured" data-sku="BK-901">x</article>'
article = BeautifulSoup(html, "lxml").find("article")

print(article["id"])                      # post-4021
print(article.get("data-sku"))             # BK-901
print(article.get("data-missing"))         # None, no error
print(article.get("data-missing", "-"))   # -

print(article["class"])                    # ['card', 'card--featured']

# This is False, even though the element has the class:
print(article["class"] == "card")          # False

# This is the check you want:
print("card" in article.get("class", []))  # True`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Data attributes are useful clues",
      body: "Attributes beginning with data- are often useful because developers may use them to connect UI elements with application data. Values such as data-id or data-price can be cleaner than visible text. They are not guaranteed to be stable or even present, so treat them as a promising signal and verify them against the page and API behavior.",
    },
    {
      kind: "code",
      language: "python",
      caption: "Extract data attributes at once",
      code: `from bs4 import BeautifulSoup

html = '''
<article data-id="4021" data-price="12.99" data-currency="GBP" data-rating="4.5">
  <span class="price">£12.99</span>
  <span class="stars">★★★★☆</span>
</article>
'''
article = BeautifulSoup(html, "lxml").find("article")

data = {
    key[5:]: value
    for key, value in article.attrs.items()
    if key.startswith("data-")
}

print(data)
# {'id': '4021', 'price': '12.99', 'currency': 'GBP', 'rating': '4.5'}`,
    },
    {
      kind: "prose",
      heading: "Parsers can disagree about broken HTML",
      body: [
        "Real HTML can be malformed: unclosed tags, invalid nesting, or attributes without quotes. Every parser repairs those mistakes, and they do not always repair them in the same way.",
        "Use lxml as a fast default. If a selector works in DevTools but fails against the raw source you fetched, first rule out JavaScript. If the source itself is malformed, html5lib follows browser-style HTML parsing rules and may produce a tree closer to the browser's parsed result. It cannot recreate DOM changes made later by JavaScript.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "The same broken input can produce different trees",
      code: `from bs4 import BeautifulSoup

broken = "<div><p>one<p>two</div>"

for parser in ["html.parser", "lxml", "html5lib"]:
    try:
        soup = BeautifulSoup(broken, parser)
    except Exception:
        print(f"{parser}: not installed")
        continue
    print(f"--- {parser} ---")
    print(soup.prettify())

# Always name the parser explicitly. If you omit it, BeautifulSoup selects
# an available parser, which can change the tree across environments.`,
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Open a product page, right-click the price, and choose Inspect. Walk upward through the Elements panel until you find the smallest container holding one complete record: title, price, and link together. That is the element you will loop over in the next chapter.",
        "Then view the page source and confirm that the same record exists in the original HTML. While inspecting, note any useful semantic attributes or data attributes, but do not assume they will be permanent without testing them.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "HTML is source text; a parser turns it into a queryable tree. The browser's live DOM may later differ because of JavaScript.",
        "View Page Source shows the original response; DevTools → Elements shows the live browser document.",
        "Element children can include whitespace text nodes. Ask for direct element children when structure matters.",
        "Anchor, up, down: find something stable, walk to the record container, then walk down to the field you need.",
        "Use get_text with a separator for nested visible text; .string can be None when an element contains child tags.",
        "BeautifulSoup represents class as a list. Data attributes can be useful clues, not automatic guarantees.",
        "Always name your parser. Different parsers build different trees from malformed source.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "dom-source-vs-live",
          question:
            "Why might a CSS selector work perfectly in the Chrome DevTools 'Elements' tab but fail in your BeautifulSoup script?",
          options: [
            "Because BeautifulSoup does not support CSS selectors.",
            "Because the DevTools 'Elements' tab shows the live DOM after JavaScript execution, while BeautifulSoup only sees the raw HTML source.",
            "Because BeautifulSoup uses python instead of JavaScript.",
            "Because Chrome blocks scraping scripts by default.",
          ],
          correctIndex: 1,
          explanation:
            "DevTools shows the DOM *after* JavaScript has run and the browser has corrected mistakes. BeautifulSoup only parses the initial HTML response you fetched.",
        },
        {
          id: "dom-beautifulsoup-class",
          question:
            "In BeautifulSoup, why will `element['class'] == 'btn'` often return False even if the element is `<div class=\"btn primary\">`?",
          options: [
            "Because class is a reserved keyword in Python.",
            "Because BeautifulSoup represents the class attribute as a list of strings, not a single string.",
            "Because BeautifulSoup automatically removes classes for security.",
            "Because you must use `element.get_class()` instead.",
          ],
          correctIndex: 1,
          explanation:
            "HTML defines the class attribute as a space-separated list of names. BeautifulSoup automatically converts this into a Python list.",
        },
        {
          id: "dom-text-extraction",
          question:
            "When extracting text from an HTML element using BeautifulSoup, why is `.get_text(strip=True)` generally safer than `.string`?",
          options: [
            ".string crashes if the text contains unicode characters.",
            ".string returns None if the element contains child HTML tags, while .get_text() recursively extracts all text inside.",
            ".get_text() automatically translates the text to English.",
            ".string only works on the <body> tag.",
          ],
          correctIndex: 1,
          explanation:
            "If a `<p>` tag contains a `<strong>` tag inside it, `.string` returns None because it is ambiguous. `.get_text()` safely extracts all text from the node and its children.",
        },
      ],
    },
  ],
};

const devTools: LessonContent = {
  slug: "developer-tools",
  title: "Developer Tools (Inspecting Elements)",
  subtitle: "How to reverse-engineer a website using the Elements and Network tabs.",
  sections: [
    {
      kind: "prose",
      heading: "The Elements Tab: Test before you code",
      body: [
        "The Elements tab is your map of the live DOM. It allows you to right-click anything on the page, select Inspect, and instantly see the HTML that renders it.",
        "Crucially, you can also press Ctrl+F (or Cmd+F) in the Elements tab to test CSS selectors or XPath queries right in the browser. This highlights matching elements and tells you exactly how many matches were found on the page. Testing your selectors here catches duplicates and errors before you even write a single line of Python.",
      ],
    },
    {
      kind: "image",
      src: devToolsImg,
      alt: "The Elements and Network Tabs",
      caption:
        "The Elements tab helps you build selectors; the Network tab helps you discover APIs.",
    },
    {
      kind: "prose",
      heading: "The Network Tab: Seeing the real requests",
      body: [
        "While the Elements tab shows you the current state of the page, the Network tab shows you how it got there. Open the Network tab before loading or interacting with the page to record all incoming and outgoing traffic.",
        "This is how you discover hidden APIs. By filtering for 'Fetch/XHR', you can often find the exact JSON endpoint the page uses to load data, saving you the trouble of parsing messy HTML.",
        "When you click on a specific request in the Network tab, you can inspect its Headers, Payload, and Response. This tells you exactly what headers the browser sent, which allows you to mimic them in your scraper to avoid being blocked.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Testing which headers are strictly required",
      code: `import requests

def find_required_headers(url, headers, expected_text):
    """
    Remove headers one by one to see which ones are actually required 
    by the server to return the correct content.
    """
    required = {}
    
    for name in headers:
        # Create a test dictionary without the current header
        test_headers = {k: v for k, v in headers.items() if k != name}
        
        try:
            response = requests.get(url, headers=test_headers, timeout=10)
            ok = response.status_code == 200 and expected_text in response.text
        except requests.RequestException:
            ok = False
            
        if ok:
            print(f"optional: {name}")
        else:
            required[name] = headers[name]
            print(f"required: {name}")

    return required

minimal = find_required_headers(
    "https://quotes.toscrape.com/",
    {
        "User-Agent": "LearningClient/1.0",
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
    },
    expected_text="Quotes to Scrape",
)
print("required headers:", minimal)`,
    },
    {
      kind: "prose",
      heading: "Two more tabs worth knowing",
      body: [
        "The command palette, opened with Ctrl+Shift+P or Cmd+Shift+P, can disable JavaScript before you reload. If the content still appears, it is a good signal that the original HTML contains it. If it disappears, JavaScript is involved, but the source may still contain embedded data or the Network panel may reveal a permitted JSON response. Treat this as a clue, not a final verdict.",
        "The Application tab shows browser storage such as cookies, local storage, and session storage. It can explain why an application remembers a logged-in browser, but its values may be sensitive. Do not copy, expose, or reuse credentials or tokens from it.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not trust Copy Selector",
      body: "Copy selector often produces a long positional path such as #main > div:nth-child(2) > div.row > div:nth-child(3) > span.a8f3d. It describes where an element happens to be today, often using fragile positions and generated class names. Use it to understand the structure, then write a shorter selector based on a stable record container and meaningful attributes.",
    },
    {
      kind: "prose",
      heading: "A routine for every new site",
      body: [
        "Use the same sequence each time. First, confirm the target is in scope: review the site's terms, available API documentation, and robots.txt. robots.txt communicates crawl preferences; it is not an access grant or a substitute for permission. Next, load the page with Network open and search the original HTML for a specific value you need.",
        "If the value is absent, inspect Network for an allowed JSON endpoint. If you do not find one, search loaded resources for embedded state. Use browser automation only when the data is legitimately available through the rendered experience and the simpler approaches do not apply. Starting with the smallest suitable approach is faster, easier to maintain, and gentler on the site.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Automate the first source-inspection step",
      code: `import requests

FRAMEWORK_HINTS = {
    "__NEXT_DATA__": "Next.js Pages Router data may be embedded",
    "self.__next_f.push": "Next.js App Router flight data may be embedded",
    "window.__NUXT__": "Nuxt state may be embedded",
    "application/ld+json": "JSON-LD structured data is present",
}

def recon(url, needle):
    response = requests.get(
        url,
        timeout=20,
        headers={"User-Agent": "LearningRecon/1.0"},
    )
    response.raise_for_status()
    html = response.text

    print(f"{url}  [{response.status_code}]  {len(html):,} characters")
    if needle in html:
        print("  -> found in source HTML; a standard HTTP client may be enough.")
        return "source"

    print("  -> not found in source HTML.")
    for marker, description in FRAMEWORK_HINTS.items():
        if marker in html:
            print(f"  -> {description}")

    print("  -> inspect Network and loaded resources next.")
    return "investigate"

recon("https://quotes.toscrape.com/", "The world as we have created it")`,
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the routine on a public practice site, a page from a system you own, and a site with a documented public API. Notice where the useful data appears in each case. The point is to choose the smallest appropriate tool, not to force every site into the same workflow.",
        "Then find a page that loads more content while you scroll. With Network open, identify the request that fires and inspect its URL, parameters, and response. Before using it programmatically, verify that doing so is permitted and that you can make a minimal, well-behaved request.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "View Page Source shows the server response; Elements shows the live browser document after parsing and possible JavaScript changes.",
        "Test CSS selectors in Elements and use the match count to catch duplicates before coding.",
        "Open Network before loading, then inspect a promising request's URL, method, parameters, payload, headers, status, and response.",
        "JSON responses and embedded state are useful leads, but access rules and credentials still matter.",
        "Treat Copy as cURL and browser storage as potentially sensitive. Use them to understand permitted requests, never to expose or replay private sessions.",
        "Start with source HTML, then Network and embedded state. Use browser automation only when it is truly needed and allowed.",
        "Avoid Copy Selector output; prefer short selectors based on stable record containers and meaningful attributes.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "devtools-copy-selector",
          question:
            "Why should you avoid using the browser's 'Copy Selector' feature to target elements for scraping?",
          options: [
            "It automatically injects tracking codes into your Python script.",
            "It generates fragile selectors that rely on exact DOM positions and dynamically generated classes, which easily break when the site updates.",
            "It copies the HTML content instead of the selector.",
            "BeautifulSoup does not support the type of selectors that browsers generate.",
          ],
          correctIndex: 1,
          explanation:
            "Copy Selector often produces overly specific paths like `#main > div:nth-child(2) > span.x8A1`. If the site design changes slightly, the selector will break immediately.",
        },
        {
          id: "devtools-network-tab",
          question:
            "What is the primary scraping benefit of monitoring the 'Fetch/XHR' traffic in the Network tab?",
          options: [
            "It allows you to download images automatically.",
            "It shows you the exact CSS styles applied to the page.",
            "It often reveals the clean JSON APIs powering the site, allowing you to bypass HTML parsing entirely.",
            "It tells you the server's IP address.",
          ],
          correctIndex: 2,
          explanation:
            "Many modern websites load data dynamically via JSON endpoints. Finding and requesting these endpoints directly is much cleaner than scraping HTML.",
        },
        {
          id: "devtools-disable-js",
          question:
            "If you disable JavaScript using the command palette and the page data disappears, what does this tell you?",
          options: [
            "The site cannot be scraped at all.",
            "You have been IP banned.",
            "The data is loaded dynamically via JavaScript, meaning you will either need to find the underlying API request in the Network tab, or use browser automation.",
            "You need to send an `Accept-Language` header.",
          ],
          correctIndex: 2,
          explanation:
            "Disappearing data means the initial HTML source does not contain what you need. It is rendered client-side, pointing you toward the Network tab to investigate APIs.",
        },
      ],
    },
  ],
};

const dynamicContent: LessonContent = {
  slug: "dynamic-vs-static-content",
  title: "Client-Side vs Server-Side Rendering",
  subtitle: "Why the DOM you see in DevTools doesn't always match the HTML you scrape.",
  sections: [
    {
      kind: "prose",
      heading: "Server-Side vs Client-Side",
      body: [
        "In traditional Server-Side Rendering (SSR), the server builds the complete HTML string and sends it to the browser. What you see in 'View Page Source' is what you get, making it perfect for basic scraping tools.",
        "In Client-Side Rendering (CSR), the server sends an empty HTML shell and a large JavaScript bundle. The browser downloads the bundle, runs the JavaScript, fetches the data (usually via an API), and then builds the DOM. If you scrape the raw HTML of a CSR page, you will just find an empty <div> and a <script> tag.",
        "Modern frameworks often use a hybrid approach like Server-Side Generation (SSG) or Hydration. They send fully rendered HTML first so the page appears instantly, then 'hydrate' it with JavaScript to make it interactive. For scraping, this is great news: the data you need is often in that initial HTML.",
      ],
    },
    {
      kind: "prose",
      heading: "Embedded JSON: The Hidden Goldmine",
      body: [
        "When a modern framework (like Next.js or Nuxt) renders a page on the server, it often embeds the raw JSON data directly into the HTML source inside a <script> tag. This allows the client-side JavaScript to hydrate the page without making an extra API call.",
        "This is incredibly valuable for scrapers. Instead of writing complex CSS selectors to extract data from the DOM, you can simply extract the JSON block and parse it natively. One common standard for embedded data is JSON-LD (JSON for Linking Data), which sites use for SEO.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Extract JSON-LD structured data",
      code: `import json
import requests
from bs4 import BeautifulSoup

def extract_json_ld(url):
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, "lxml")

    blocks = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string or "")
        except json.JSONDecodeError:
            continue

        if isinstance(data, list):
            blocks.extend(data)
        elif isinstance(data, dict) and isinstance(data.get("@graph"), list):
            blocks.extend(data["@graph"])
        else:
            blocks.append(data)

    return blocks

# Pass a page you are permitted to inspect.
# for block in extract_json_ld("https://example.com/product/123"):
#     print(block.get("@type"), "->", block.get("name") or block.get("headline"))`,
    },
    {
      kind: "prose",
      heading: "Choose the smallest appropriate approach",
      body: [
        "When the initial HTML does not contain your target data, work down a short list and stop at the first permitted option that works: a documented official API, a publicly accessible JSON response the site allows you to use, JSON-LD, or explicitly embedded JSON. Browser automation is the last option, not the first.",
        "The cost difference can be substantial, but it varies by page and environment. A plain HTTP request is usually simpler and lighter than launching a browser. Across a large crawl, choosing the smallest suitable tool makes the job easier to run, debug, and maintain.",
      ],
    },
    {
      kind: "image",
      src: renderingLadderImg,
      alt: "Strategies to investigate before reaching for browser automation.",
      caption:
        "Start with the simplest permitted data source before reaching for browser automation.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "When page one works and page two does not",
      body: "A server-rendered first page with JavaScript-driven navigation can cause this pattern, but it is not the only explanation. Treat it as a clue. Compare the source HTML for both pages, then use Network to identify whether pagination triggers a request, changes query parameters, or needs a different allowed data source.",
    },
    {
      kind: "prose",
      heading: "Robots.txt and sitemaps",
      body: [
        "A site can publish robots.txt at /robots.txt to communicate crawl preferences and point to sitemaps. It is useful context and sitemaps can be a much better URL-discovery source than crawling navigation links.",
        "robots.txt is not an access grant, a legal conclusion, or a substitute for checking site terms and applicable requirements. Read it alongside the site's documented API and usage policies before you automate requests.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Read robots.txt and discover sitemaps",
      code: `import urllib.robotparser
from urllib.parse import urlparse

def robots_check(url, user_agent="LearningBot/1.0"):
    parts = urlparse(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"

    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(robots_url)
    try:
        parser.read()
    except OSError as error:
        print(f"could not read {robots_url}: {error}")
        return None

    print(f"robots.txt: {robots_url}")
    print(f"  allowed for {user_agent}: {parser.can_fetch(user_agent, url)}")
    print(f"  crawl delay: {parser.crawl_delay(user_agent)}")
    print(f"  sitemaps: {parser.site_maps()}")
    return parser.can_fetch(user_agent, url)

robots_check("https://quotes.toscrape.com/page/2/")`,
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run inspect_initial_html against a public practice site, a page from a system you own, and a page with a documented public API. Use a distinctive visible value as the needle. Record whether it appears in source, JSON-LD, an explicit JSON script block, or a later permitted request.",
        "For a page that loads more content while scrolling, keep Network open and identify the request that fires. Inspect its URL, parameters, and response. Before calling it in code, verify that the use is permitted and make only the minimal, well-behaved request you need.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "SSR, SSG, CSR, and hydration can coexist. The practical question is where your target data first appears.",
        "A selector that works in the live DOM may not exist in the initial HTML response.",
        "Search source first, then inspect embedded JSON, JSON-LD, and permitted Network responses before considering browser automation.",
        "Framework markers and text-size heuristics are clues, not proof of how a page delivers data.",
        "A generic extractor can safely handle explicit JSON script blocks, but not arbitrary JavaScript or every framework-specific data format.",
        "Browser automation is often heavier and more complex than a direct HTTP request; choose it only when it is needed and allowed.",
        "robots.txt and sitemaps help with discovery, but they do not grant permission to scrape.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "dynamic-ssr-vs-csr",
          question:
            "If you scrape a page with BeautifulSoup and it only returns a <div> and a <script> tag, what are you likely dealing with?",
          options: [
            "A Server-Side Rendered (SSR) page.",
            "A Client-Side Rendered (CSR) page where JavaScript builds the DOM after loading.",
            "A page blocked by a CAPTCHA.",
            "A 404 Error page.",
          ],
          correctIndex: 1,
          explanation:
            "In CSR, the server just sends an empty shell. The browser must execute the JavaScript bundle to actually fetch the data and build the HTML.",
        },
        {
          id: "dynamic-json-ld",
          question:
            "Why is finding JSON-LD or embedded Next.js data blocks in the HTML source considered a 'goldmine' for scraping?",
          options: [
            "It gives you the passwords of other users.",
            "It allows you to bypass robots.txt restrictions.",
            "You can parse the data directly as JSON using `json.loads()`, which is vastly simpler and less fragile than writing CSS selectors to extract text from HTML.",
            "It forces the server to respond faster.",
          ],
          correctIndex: 2,
          explanation:
            "Parsing JSON natively guarantees you get the raw data in a structured format, completely avoiding the fragility of HTML DOM selectors.",
        },
        {
          id: "dynamic-automation-ladder",
          question:
            "According to the 'smallest appropriate approach' rule, when should you use heavy browser automation tools like Playwright or Selenium?",
          options: [
            "It should always be your first choice because it renders everything perfectly.",
            "Only when the data is not in the source HTML, not in an embedded JSON block, not available via a direct API request, and the site permits its use.",
            "Only when you want to run your scraper faster.",
            "Never, because browser automation is illegal.",
          ],
          correctIndex: 1,
          explanation:
            "Browser automation is resource-intensive and complex to maintain. Always try simple HTTP requests (for HTML or APIs) before resorting to spinning up a full browser.",
        },
      ],
    },
  ],
};

const fundamentalsQuiz: LessonContent = {
  slug: "fundamentals-quiz",
  title: "Foundations & Basics: Final Quiz",
  subtitle: "Test your knowledge of the web, HTTP, and browser rendering.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "fq-1",
          question: "What is the fundamental cycle that powers both browsers and web scrapers?",
          options: [
            "The Request-Response cycle",
            "The Event Loop",
            "The Client-Side Rendering cycle",
            "The Data Hydration cycle",
          ],
          correctIndex: 0,
          explanation:
            "Every scraper relies on the basic HTTP Request-Response cycle: you act as the client sending a request, and the server returns a response.",
        },
        {
          id: "fq-2",
          question:
            "Which HTTP method is specifically designed to ask the server for headers without downloading the body?",
          options: ["GET", "HEAD", "OPTIONS", "POST"],
          correctIndex: 1,
          explanation:
            "The HEAD method is perfect for checking things like file size or Last-Modified dates without wasting bandwidth downloading the file.",
        },
        {
          id: "fq-3",
          question: "What does a 403 Forbidden status code indicate?",
          options: [
            "The server cannot find the page.",
            "The server is down or broken.",
            "The server understands the request but refuses to authorize it.",
            "You are sending too many requests.",
          ],
          correctIndex: 2,
          explanation:
            "403 means you don't have permission. This might mean you need to log in, or it might mean the site blocked your scraper.",
        },
        {
          id: "fq-4",
          question: "Why is the `User-Agent` header so critical in web scraping?",
          options: [
            "It tells the server your IP address.",
            "It tells the server what software is making the request, and servers often block generic Python scripts.",
            "It is required by law to scrape public data.",
            "It forces the server to return JSON instead of HTML.",
          ],
          correctIndex: 1,
          explanation:
            "Many sites block default User-Agents like `python-requests`. Changing it to mimic a browser (or identifying your bot responsibly) is often the first step in scraping.",
        },
        {
          id: "fq-5",
          question:
            "How does a `requests.Session` handle cookies differently than a simple `requests.get()`?",
          options: [
            "It encrypts the cookies for security.",
            "It automatically persists cookies across multiple requests.",
            "It deletes all cookies before every request.",
            "It forces the server to accept third-party cookies.",
          ],
          correctIndex: 1,
          explanation:
            "A Session maintains a 'cookie jar', automatically sending back cookies the server issued, which is essential for maintaining state like logins.",
        },
        {
          id: "fq-6",
          question:
            "What is the primary benefit of the server sending an `ETag` or `Last-Modified` header?",
          options: [
            "It proves to the server that you are a real human.",
            "It allows the client to make conditional requests and save bandwidth.",
            "It forces the server to always return the freshest data possible.",
            "It allows you to authenticate without a password.",
          ],
          correctIndex: 1,
          explanation:
            "Conditional requests let the server reply with a 304 Not Modified if the data hasn't changed, saving bandwidth and processing time for both sides.",
        },
        {
          id: "fq-7",
          question: "What is the key difference between the raw HTML source and the live DOM?",
          options: [
            "The raw HTML source is written in Python, while the live DOM is written in JavaScript.",
            "The live DOM includes modifications made by JavaScript after the page loaded.",
            "The raw HTML source is only visible on Mac computers.",
            "The live DOM is always smaller in file size.",
          ],
          correctIndex: 1,
          explanation:
            "The DOM is the tree structure created *after* the browser parses the HTML and runs JavaScript. Scrapers only see the raw HTML source unless they use browser automation.",
        },
        {
          id: "fq-8",
          question:
            "In BeautifulSoup, why does `element['class'] == 'btn'` often return False for `<div class=\"btn primary\">`?",
          options: [
            "Because BeautifulSoup automatically removes classes for security.",
            "Because class is a reserved keyword in Python.",
            "Because BeautifulSoup exposes the class attribute as a list of strings.",
            "Because you must use `.get_class()` instead.",
          ],
          correctIndex: 2,
          explanation:
            "HTML defines `class` as a space-separated list, so BeautifulSoup parses it into a Python list like `['btn', 'primary']`.",
        },
        {
          id: "fq-9",
          question: "What is the 'Anchor, up, down' scraping strategy?",
          options: [
            "Finding a unique stable element, walking up to the container, and walking down to extract fields.",
            "Starting at the bottom of the page and scrolling up.",
            "Using an <a> tag to download a file.",
            "Checking the header, then the footer, then the body.",
          ],
          correctIndex: 0,
          explanation:
            "This strategy prevents fragile paths. You anchor on something unique (like a title), walk up to the parent record container, and then extract the siblings.",
        },
        {
          id: "fq-10",
          question:
            "Why should you avoid relying heavily on the browser's 'Copy Selector' feature?",
          options: [
            "It generates fragile, highly positional selectors that break easily.",
            "It automatically injects tracking codes into your Python script.",
            "It copies the HTML content instead of the selector.",
            "BeautifulSoup does not support CSS selectors.",
          ],
          correctIndex: 0,
          explanation:
            "Copy Selector often produces paths like `#main > div:nth-child(2) > span.x8A1`, which break the moment the site layout changes slightly.",
        },
        {
          id: "fq-11",
          question:
            "If you disable JavaScript via the command palette and the data disappears, what should your next step be?",
          options: [
            "Give up, the site cannot be scraped.",
            "Open the Network tab and look for the underlying JSON API request.",
            "Use a regular expression to parse the JavaScript.",
            "Change your IP address.",
          ],
          correctIndex: 1,
          explanation:
            "If the data isn't in the HTML, it's being loaded by JavaScript. The Network tab will reveal the clean JSON API the JavaScript is calling.",
        },
        {
          id: "fq-12",
          question: "What is Client-Side Rendering (CSR)?",
          options: [
            "The server builds the complete HTML string and sends it to the browser.",
            "The server sends an empty HTML shell, and JavaScript fetches data to build the DOM.",
            "The browser sends JavaScript to the server to execute.",
            "The server renders the page as a static image.",
          ],
          correctIndex: 1,
          explanation:
            "In CSR, the server just provides an empty `<div>` and a script tag. The browser does all the heavy lifting to fetch data and render the page.",
        },
        {
          id: "fq-13",
          question:
            "Why is JSON-LD or embedded `__NEXT_DATA__` considered a goldmine for scraping?",
          options: [
            "It gives you the passwords of other users.",
            "It bypasses rate limits automatically.",
            "It allows you to parse clean, structured JSON natively instead of relying on fragile CSS selectors.",
            "It forces the server to respond faster.",
          ],
          correctIndex: 2,
          explanation:
            "Instead of writing fragile HTML selectors, you can extract the embedded JSON string and use `json.loads()` to get perfectly structured data instantly.",
        },
        {
          id: "fq-14",
          question:
            "When should you use heavy browser automation tools like Playwright or Selenium?",
          options: [
            "Always, it should be your first choice.",
            "Never, because it is illegal.",
            "Only when the data is not in the HTML, not in embedded JSON, not in a direct API request, and the site permits its use.",
            "Whenever you want the scraper to run faster.",
          ],
          correctIndex: 2,
          explanation:
            "Browser automation is slow, resource-intensive, and hard to maintain. It should be the absolute last resort on the 'smallest appropriate approach' ladder.",
        },
        {
          id: "fq-15",
          question: "What is the primary purpose of `robots.txt`?",
          options: [
            "To grant you legal permission to scrape the site.",
            "To provide a list of passwords for the site's APIs.",
            "To communicate crawl preferences and point to sitemaps.",
            "To block IP addresses that scrape too fast.",
          ],
          correctIndex: 2,
          explanation:
            "`robots.txt` is a polite request from the site owner about what they prefer you to crawl. It is not a legal document or an access control mechanism.",
        },
      ],
    },
  ],
};

// ==========================================
// CHAPTER 2: Static Scraping
// ==========================================
const firstRequest: LessonContent = {
  slug: "your-first-request",
  title: "Your First Request",
  subtitle: "fetching HTML and reading a response object",
  sections: [],
};
const parsingSoup: LessonContent = {
  slug: "parsing-html-beautifulsoup",
  title: "Parsing HTML with BeautifulSoup",
  subtitle: "soup objects, tags, and navigation",
  sections: [],
};
const cssSelectors: LessonContent = {
  slug: "css-selectors",
  title: "CSS Selectors in Practice",
  subtitle: "select, select_one, and choosing stable selectors",
  sections: [],
};
const xpathLxml: LessonContent = {
  slug: "xpath-and-lxml",
  title: "XPath and lxml",
  subtitle: "when CSS runs out and why Scrapy will need this",
  sections: [],
};
const extractingAttributes: LessonContent = {
  slug: "extracting-text-attributes",
  title: "Extracting Text and Attributes",
  subtitle: "strings, hrefs, data attributes, and whitespace",
  sections: [],
};
const pagination: LessonContent = {
  slug: "following-pagination",
  title: "Following Pagination",
  subtitle: "URL patterns, next links, and knowing when to stop",
  sections: [],
};

// ==========================================
// CHAPTER 3: Cleaning & Storing
// ==========================================
const definingSchema: LessonContent = {
  slug: "defining-your-schema",
  title: "Defining Your Schema First",
  subtitle: "deciding output shape before you write the parser",
  sections: [],
};
const regexExtraction: LessonContent = {
  slug: "regex-for-extraction",
  title: "Regex for Extraction",
  subtitle: "pulling prices, dates, and IDs out of messy text",
  sections: [],
};
const normalizingData: LessonContent = {
  slug: "normalizing-data",
  title: "Normalizing Data",
  subtitle: "types, encodings, currencies, timestamps, and null handling",
  sections: [],
};
const pandasScraping: LessonContent = {
  slug: "pandas-for-scraped-data",
  title: "Pandas for Scraped Data",
  subtitle: "dataframes, deduplication, and quick validation",
  sections: [],
};
const exportingFormats: LessonContent = {
  slug: "exporting-csv-json",
  title: "Exporting to CSV, JSON, and JSONL",
  subtitle: "choosing a format and why JSONL wins at scale",
  sections: [],
};
const storingSql: LessonContent = {
  slug: "storing-sqlite-postgres",
  title: "Storing in SQLite and Postgres",
  subtitle: "upserts, primary keys, and idempotent writes",
  sections: [],
};

export const FOUNDATION_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "http-foundations": {
    slug: "http-foundations",
    title: "HTTP Foundations",
    category: "Foundations & Basics",
    blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
    iconKey: "globe",
    lessons: [
      howTheWebWorks,
      httpMethods,
      headersCookies,
      theDom,
      devTools,
      dynamicContent,
      fundamentalsQuiz,
    ],
  },
  "static-scraping": {
    slug: "static-scraping",
    title: "Static Scraping with Requests and BeautifulSoup",
    category: "Foundations & Basics",
    blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
    iconKey: "search",
    lessons: [firstRequest, parsingSoup, cssSelectors, xpathLxml, extractingAttributes, pagination],
  },
  "cleaning-and-storing": {
    slug: "cleaning-and-storing",
    title: "Cleaning, Structuring, and Storing",
    category: "Foundations & Basics",
    blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
    iconKey: "database",
    lessons: [
      definingSchema,
      regexExtraction,
      normalizingData,
      pandasScraping,
      exportingFormats,
      storingSql,
    ],
  },
};
