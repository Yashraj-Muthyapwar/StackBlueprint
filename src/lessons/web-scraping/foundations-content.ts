import { type LessonContent } from "@/lessons/types";
import howWebWorksImg from "@/images/web-scraping/foundations/how-web-works.png";
import httpMethodsImg from "@/images/web-scraping/foundations/http-methods.png";
import httpQueryMethodImg from "@/images/web-scraping/foundations/http-query-method.png";
import httpStatusCodesImg from "@/images/web-scraping/foundations/http-status-codes.png";

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
        "That same request-response cycle powers every scraper in this course. The difference is that, instead of asking a browser to do the work for us, we will often make the request directly in Python and keep only the data we need."
      ]
    },
    {
      kind: "analogy",
      title: "The Restaurant Analogy",
      text: "Think of a website as a restaurant. You are the client. You choose an item from the menu and give the waiter a precise order: that is the request. The kitchen is the server: it receives the order, prepares the result, and sends it back as the response. A scraper is a program that places those orders automatically and records the useful parts of what comes back. The important detail: the kitchen can only respond to the information in the order it receives."
    },
    {
      kind: "prose",
      heading: "Clients, Servers, and HTTP",
      body: [
        "Your browser is a client. A web service is a server. When you enter a URL, the client sends an HTTP request to the server and the server returns an HTTP response. The request describes what you want; the response contains a status code, headers, and usually a body.",
        "For example, requesting a page with GET might return 200 OK and an HTML document. A missing page might return 404. A server asking you to slow down might return 429. We will work with those responses throughout this track."
      ]
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
        "Only after those steps can HTTP begin. This is why a slow request is not always a slow website: the delay may come from name lookup, network distance, encryption setup, server work, or downloading the response."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "A browser page is usually many requests",
      body: "The first HTML response is often a starting point, not the entire page. A browser may then fetch CSS, JavaScript, images, fonts, and JSON data from APIs. requests.get(url) makes one request; it does not automatically run JavaScript or fetch everything the browser discovers afterward."
    },
    {
      kind: "prose",
      heading: "The Anatomy of a URL",
      body: [
        "A URL is not just an address; it is a set of instructions. It usually consists of a **scheme** (like `https://`), a **host** (`en.wikipedia.org`), a **path** (`/w/index.php`), and sometimes a **query** string (`?title=Web_scraping`).",
        "It can also include a **fragment** (`#Legal_issues`) at the very end. The fragment is used by the browser to scroll to a specific part of the page or manage state, but here is the crucial detail for scraping: the fragment is never sent to the server. If a page loads different data based on the fragment, it is happening entirely in the browser via JavaScript."
      ]
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
# {'title': ['Web_scraping'], 'oldid': ['1173934305']}`
    },
    {
      kind: "prose",
      heading: "Where scraping fits in",
      body: [
        "For a static site, the useful data may already be in the HTML response. In that case, a normal HTTP client such as requests is fast, simple, and usually the right tool. Your code requests the HTML, parses it, and extracts the fields you care about.",
        "For a JavaScript-heavy site, the initial HTML can be mostly an empty shell. The browser may request the actual data from a JSON API after the page loads. Later in this course, you will learn how to find and reproduce that API request and when browser automation with Playwright is the better choice."
      ]
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
print(response.text[:100])                  # <!DOCTYPE html>\\n<html class="client-nojs"...`
    },
    {
      kind: "prose",
      heading: "One request, not a disguised browser",
      body: [
        "A scraper is not invisible just because it uses Python. Websites can examine the request's headers, cookies, IP reputation, timing, and TLS fingerprint. They can often distinguish a browser from a script, and they may enforce rate limits or access rules accordingly.",
        "Our goal is not to imitate every part of a browser by default. It is to make the smallest, clearest request that returns data we are allowed to collect and then handle the result responsibly."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "Scraping vs APIs",
      body: "Wikipedia offers an API, and in a real project you would prefer it over scraping HTML. We are scraping the HTML here because the mechanics are what we are learning."
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the example against a simple site. Look at the status code, content type, and first few characters of the response. Then open the same URL in your browser, open DevTools -> Network, and reload the page.",
        "Notice the difference: your script made one request, while the browser likely made several. In later lessons, that Network panel will help you find exactly where a site gets its data."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "The web uses a client-server model: clients send requests and servers return responses.",
        "Before HTTP begins, DNS, a network connection, and usually TLS must succeed.",
        "An HTTP response includes a status code, headers, and a body such as HTML or JSON.",
        "One browser page load can involve many requests; one requests.get call makes only one.",
        "Start with the simplest allowed request that gives you the data you need."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "how-the-web-works-requests",
          question: "How does `requests.get()` behave compared to a normal web browser opening a page?",
          options: [
            "It automatically downloads all images and CSS files.",
            "It executes JavaScript exactly like a browser.",
            "It makes exactly one HTTP request and returns the raw response.",
            "It hides your identity from the server."
          ],
          correctIndex: 2,
          explanation: "A single `requests.get()` fetches exactly what you ask for and nothing more. It doesn't parse the HTML to discover and download extra assets or run JS."
        },
        {
          id: "how-the-web-works-fragment",
          question: "In the URL `https://example.com/products?sort=price#reviews`, what does the server do with the `#reviews` fragment?",
          options: [
            "It uses it to filter the database query.",
            "It ignores it because fragments are never sent to the server.",
            "It redirects the user to the reviews page.",
            "It returns JSON instead of HTML."
          ],
          correctIndex: 1,
          explanation: "The fragment is handled entirely client-side by the browser. The server only sees the path and the query string."
        },
        {
          id: "how-the-web-works-detection",
          question: "Why should we avoid thinking our scraper is 'invisible' to the website?",
          options: [
            "Because Python is slower than JavaScript.",
            "Because websites can examine request headers, TLS fingerprints, and behavior to distinguish a script from a real browser.",
            "Because scrapers cannot connect over HTTPS.",
            "Because every scraping request requires an API key."
          ],
          correctIndex: 1,
          explanation: "Servers look at details like User-Agent headers, IP reputation, and TLS fingerprints. A generic python script looks very different from Chrome."
        }
      ]
    }
  ]
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
        "**HEAD:** This asks for the exact same response as a GET, but without downloading the response body. It is extremely useful when you just want to check if a file exists or read its size (via the Content-Length header) without wasting bandwidth."
      ]
    },
    {
      kind: "image",
      src: httpMethodsImg,
      alt: "Common HTTP Methods",
      caption: "Common HTTP Methods used in web scraping."
    },
    {
      kind: "prose",
      heading: "The emerging QUERY method",
      body: [
        "Historically, if you wanted to fetch data using a complex, deeply nested query, you ran into a problem. GET requests are not supposed to have a body, and many servers simply ignore it if you try. Putting massive queries in the URL string is messy and often hits length limits. POST allows a body, but it is technically meant for modifying data, not for safe, read-only queries.",
        "To solve this exact issue, the IETF is standardizing a new **QUERY** method. It acts exactly like a GET, meaning it is safe, idempotent, and cacheable. However, it allows you to send your query payload in the request body. As APIs modernize, you will start seeing this method used to fetch data without resorting to POST."
      ]
    },
    {
      kind: "image",
      src: httpQueryMethodImg,
      alt: "The HTTP QUERY Method",
      caption: "The HTTP QUERY Method allows a request body like POST but remains safe and idempotent like GET."
    },
    {
      kind: "prose",
      heading: "Status Codes: What happened?",
      body: [
        "Every HTTP response includes a three-digit status code. The first digit is the most important one because it defines the broad category of the result.",
        "**2xx (Success):** The server successfully processed your request. **200 OK** is the standard success code you will see most often. **201 Created** means a resource was successfully made on the server.",
        "**3xx (Redirection):** The resource has moved, and the server is telling you where to go next. **301 Moved Permanently** means the URL has changed for good, while **302 Found** is just a temporary redirect. **304 Not Modified** tells you that your cached copy is still perfectly fresh.",
        "**4xx (Client Error):** You made a mistake. **400 Bad Request** means your syntax is invalid. **401 Unauthorized** means you need to log in first. **403 Forbidden** means you lack permission (or your scraper was detected and blocked!). **404 Not Found** means the resource does not exist. **429 Too Many Requests** means you have hit a rate limit and need to slow down.",
        "**5xx (Server Error):** The server failed to fulfill a perfectly valid request. **500 Internal Server Error** is a generic backend crash. **502 Bad Gateway** often means a proxy or load balancer failed to reach the main application. **503 Service Unavailable** means the server is overloaded or down for maintenance."
      ]
    },
    {
      kind: "image",
      src: httpStatusCodesImg,
      alt: "HTTP Status Codes",
      caption: "The main categories of HTTP Status Codes."
    },
    {
      kind: "callout",
      tone: "warn",
      title: "200 OK does not mean 'Success'",
      body: "A server might return a 200 OK status code, but the body of the response could be a captcha, a login page, or a generic 'Item not found' message wrapped in standard HTML. Always validate the content type and look for a specific marker in the HTML to confirm you received the data you expected."
    },
    {
      kind: "prose",
      heading: "Following Redirects",
      body: [
        "By default, the requests library will automatically follow 3xx redirects for you. This is usually what you want, but it can mask problems. If a product page is removed, the server might redirect you to the home page with a 200 OK.",
        "You can check if a redirect occurred by inspecting response.history. You can also disable automatic redirects by setting allow_redirects=False. This lets you inspect the raw 3xx response and the 'Location' header to see exactly where the server is trying to send you."
      ]
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
print(raw.status_code, raw.headers.get("location"))`
    },
    {
      kind: "prose",
      heading: "Retrying, carefully",
      body: [
        "Over thousands of requests, some will fail for reasons unrelated to your code: a dropped connection, a server restart, or a brief load-balancer problem. Retries help with those temporary failures.",
        "Retry the right things. Network timeouts and selected 5xx responses are reasonable to try again with exponential backoff. For 429, wait as long as the server asks. For 403, do not blindly retry: stop and inspect whether the site requires authentication, has blocked access, or does not permit the request."
      ]
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
    return None`
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why add randomness?",
      body: "The small random delay is called jitter. Without it, requests that fail together often retry together too, creating another spike of traffic. Jitter spreads those retries out."
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "httpbin.org can return a chosen status code, making it useful for testing response handling. Try get_with_retry against /status/200, /status/404, /status/503, and /status/403. To avoid a long wait while testing 429 without a Retry-After header, use attempts=1 or set default_retry_after=0.",
        "Then request /redirect/3 and inspect response.history. You should see three redirect hops, a final 200 response, and a response.url that differs from the URL you requested."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "The URL identifies a resource; the HTTP method communicates your intended action.",
        "GET is the standard safe read request. HEAD returns metadata without a response body when the server supports it.",
        "Status-code families tell you what happened: 2xx succeeded, 3xx redirects or validates a cache, 4xx was rejected, and 5xx failed on the server.",
        "A 200 is not proof that you got the right content. Validate type, content, and a target-specific marker.",
        "Retry temporary network failures and selected 5xx responses with backoff and jitter. Respect 429 and inspect 403 rather than blindly repeating it.",
        "Check response.url and response.history when the data looks wrong. Redirects can hide a missing page."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "http-methods-200-ok",
          question: "If a server returns a 200 OK status code, does this guarantee that you received the data you wanted?",
          options: [
            "Yes, 200 OK means the page loaded perfectly.",
            "Yes, unless the Content-Type is missing.",
            "No, the server might return a 200 OK for a captcha, login page, or soft error page.",
            "No, 200 OK actually means the request was rate-limited."
          ],
          correctIndex: 2,
          explanation: "Websites often return 200 OK even when displaying an error message or a captcha. You must validate the actual content to be sure."
        },
        {
          id: "http-methods-retrying",
          question: "Which of the following status codes should you NOT blindly retry?",
          options: [
            "408 Request Timeout",
            "502 Bad Gateway",
            "503 Service Unavailable",
            "403 Forbidden"
          ],
          correctIndex: 3,
          explanation: "A 403 Forbidden means the server understands your request but refuses to authorize it. Retrying will not help and may get your IP banned."
        },
        {
          id: "http-methods-jitter",
          question: "What is the purpose of adding 'jitter' to an exponential backoff retry loop?",
          options: [
            "To make the code look more complex.",
            "To prevent multiple failed requests from retrying at the exact same time and causing a traffic spike.",
            "To bypass Cloudflare protection.",
            "To wait exactly 60 seconds before retrying."
          ],
          correctIndex: 1,
          explanation: "Jitter adds a small amount of randomness to the delay, spreading out retries and avoiding a synchronized wave of requests hitting the server."
        }
      ]
    }
  ]
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
        "Other important headers include Accept, which tells the server what kind of content you want (like HTML or JSON), and Accept-Language, which tells the server your preferred language."
      ]
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
print(response.json())`
    },
    {
      kind: "prose",
      heading: "Conditional Requests",
      body: [
        "Sometimes you need to scrape a page repeatedly to check for updates. Instead of downloading the whole page every time, you can use headers to ask the server if anything has changed.",
        "If the server provides an ETag (a unique version identifier) or a Last-Modified date in its response, you can send those back in your next request using the If-None-Match or If-Modified-Since headers.",
        "If the content hasn't changed, the server will return a 304 Not Modified status code with no body. This saves you bandwidth and makes your scraper much faster and more polite."
      ]
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
print(response2.status_code) # 304`
    },
    {
      kind: "prose",
      heading: "Cookies: Remembering State",
      body: [
        "HTTP does not remember a previous request on its own. A server needs an explicit way to connect your cart, login, or preferences to the next request you make.",
        "The server can send a Set-Cookie header. A client that stores it will return the appropriate cookie in later Cookie headers, subject to cookie rules such as domain, path, Secure, and expiry. That is how state can persist across separate HTTP requests."
      ]
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
print(response.json())  # {'cookies': {}}`
    },
    {
      kind: "prose",
      heading: "Sessions preserve state and can reuse connections",
      body: [
        "requests.Session keeps a cookie jar across its requests and gives you one place to set shared headers. It is a strong default when a scraper makes repeated requests to the same host or needs a stateful flow such as a permitted login.",
        "A Session also maintains a pool of reusable connections. When the server keeps a connection available, later requests can reuse it and avoid some setup work. This is an optimization, not a guarantee: servers can close connections and network timing still varies."
      ]
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
    print(response.json())  # {'cookies': {'band': 'gold'}}`
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
# network conditions can make the difference small or large.`
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not paste browser headers or cookies blindly",
      body: "Remove Host and Content-Length from copied requests because requests computes them. Avoid advertising compression you cannot decode. Never hardcode a copied Cookie header: values expire, may be scoped to a different domain, and can expose an authenticated session. Let a Session manage cookies where you have permission to use them."
    },
    {
      kind: "prose",
      heading: "Cookie scope causes real bugs",
      body: [
        "Cookies are not global. Host-only cookies set by shop.example.com are sent back only to that host, not automatically to api.example.com. A cookie with Domain=example.com can apply to that domain and its subdomains. Path rules can narrow the scope further, and Secure cookies are sent only over HTTPS.",
        "This creates a familiar symptom: a permitted login works on the main site, but requests to a related API return 401. Before rewriting your authentication logic, inspect the cookie's domain, path, expiry, and Secure flag."
      ]
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
    )`
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the header inspection once with requests defaults and once with the small HEADERS dictionary. Compare what changes. Do not try to recreate every browser header; identify which specific response difference you are investigating.",
        "Then run the session comparison. Increase COUNT to fifty and observe the result, but treat it as a local experiment rather than a universal performance claim. Finally, run the ETag example and see whether the target server offers a validator."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Headers provide request context and response metadata; inspect them before changing them.",
        "A User-Agent, Accept, language preference, and compression support should be intentional, not copied wholesale from a browser.",
        "ETag and Last-Modified support conditional requests, which can return 304 without downloading an unchanged body.",
        "Cookies preserve state across requests, either as session identifiers or as client-held state.",
        "A requests.Session is a strong default for repeated requests to the same host: it retains cookies and may reuse connections.",
        "Cookies follow domain, path, Secure, and expiry rules; a login on one host may not apply to another."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "headers-cookies-session",
          question: "Why should you use a `requests.Session` when scraping multiple pages from the same website?",
          options: [
            "It runs the requests in parallel to speed up scraping.",
            "It automatically executes JavaScript on the pages you request.",
            "It persists cookies across requests and can reuse the underlying network connection.",
            "It automatically bypasses Cloudflare and other bot protections."
          ],
          correctIndex: 2,
          explanation: "A Session acts like a continuous browsing session: it stores any cookies the server sets and sends them back on the next request, and connection pooling speeds up subsequent requests."
        },
        {
          id: "headers-cookies-etag",
          question: "What is the primary benefit of using ETag or Last-Modified headers in your requests?",
          options: [
            "They prove to the server that you are a real human.",
            "They allow the server to return a 304 Not Modified without sending the full response body if the data hasn't changed.",
            "They force the server to always return the freshest data possible.",
            "They allow you to authenticate without a password."
          ],
          correctIndex: 1,
          explanation: "Conditional requests save bandwidth. If the ETag matches what the server has, it returns 304 instead of sending the exact same payload again."
        },
        {
          id: "headers-cookies-copy",
          question: "Why is it a bad idea to blindly copy all headers and cookies from your browser's network tab into your scraper script?",
          options: [
            "Because Python cannot handle headers that are too long.",
            "Because the server will know you are using Python if you send too many headers.",
            "Because cookies expire, some headers (like Content-Length) are automatically managed by requests, and copying authentication cookies can leak your personal session.",
            "Because copying headers is illegal."
          ],
          correctIndex: 2,
          explanation: "Never hardcode cookies or dynamic headers. Let requests handle `Content-Length` and let a Session manage cookies dynamically."
        }
      ]
    }
  ]
};

const theDom: LessonContent = {
  slug: "the-dom",
  title: "The Document Object Model (DOM)",
  subtitle: "How HTML becomes a tree structure that you can query.",
  sections: [],
};

const devTools: LessonContent = {
  slug: "developer-tools",
  title: "Developer Tools (Inspecting Elements)",
  subtitle: "How to reverse-engineer a website using the Elements and Network tabs.",
  sections: [],
};

const dynamicContent: LessonContent = {
  slug: "dynamic-vs-static-content",
  title: "Client-Side vs Server-Side Rendering",
  subtitle: "Why the DOM you see in DevTools doesn't always match the HTML you scrape.",
  sections: [],
};

// ==========================================
// CHAPTER 2: Static Scraping
// ==========================================
const firstRequest: LessonContent = { slug: "your-first-request", title: "Your First Request", subtitle: "fetching HTML and reading a response object", sections: [] };
const parsingSoup: LessonContent = { slug: "parsing-html-beautifulsoup", title: "Parsing HTML with BeautifulSoup", subtitle: "soup objects, tags, and navigation", sections: [] };
const cssSelectors: LessonContent = { slug: "css-selectors", title: "CSS Selectors in Practice", subtitle: "select, select_one, and choosing stable selectors", sections: [] };
const xpathLxml: LessonContent = { slug: "xpath-and-lxml", title: "XPath and lxml", subtitle: "when CSS runs out and why Scrapy will need this", sections: [] };
const extractingAttributes: LessonContent = { slug: "extracting-text-attributes", title: "Extracting Text and Attributes", subtitle: "strings, hrefs, data attributes, and whitespace", sections: [] };
const pagination: LessonContent = { slug: "following-pagination", title: "Following Pagination", subtitle: "URL patterns, next links, and knowing when to stop", sections: [] };

// ==========================================
// CHAPTER 3: Cleaning & Storing
// ==========================================
const definingSchema: LessonContent = { slug: "defining-your-schema", title: "Defining Your Schema First", subtitle: "deciding output shape before you write the parser", sections: [] };
const regexExtraction: LessonContent = { slug: "regex-for-extraction", title: "Regex for Extraction", subtitle: "pulling prices, dates, and IDs out of messy text", sections: [] };
const normalizingData: LessonContent = { slug: "normalizing-data", title: "Normalizing Data", subtitle: "types, encodings, currencies, timestamps, and null handling", sections: [] };
const pandasScraping: LessonContent = { slug: "pandas-for-scraped-data", title: "Pandas for Scraped Data", subtitle: "dataframes, deduplication, and quick validation", sections: [] };
const exportingFormats: LessonContent = { slug: "exporting-csv-json", title: "Exporting to CSV, JSON, and JSONL", subtitle: "choosing a format and why JSONL wins at scale", sections: [] };
const storingSql: LessonContent = { slug: "storing-sqlite-postgres", title: "Storing in SQLite and Postgres", subtitle: "upserts, primary keys, and idempotent writes", sections: [] };

export const FOUNDATION_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "http-foundations": {
    slug: "http-foundations",
    title: "HTTP Foundations",
    category: "Foundations & Basics",
    blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
    iconKey: "globe",
    lessons: [howTheWebWorks, httpMethods, headersCookies, theDom, devTools, dynamicContent],
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
    lessons: [definingSchema, regexExtraction, normalizingData, pandasScraping, exportingFormats, storingSql],
  },
};
