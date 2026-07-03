import { type LessonContent, type Section } from "@/lessons/types";

export type { Section };

import containerPackageImg from "@/images/docker/foundations/container-package.jpg";
import whyDockerExistsImg from "@/images/docker/foundations/why-docker-exists.jpg";
import containerRevolutionImg from "@/images/docker/foundations/container-revolution.jpg";
import vmVsContainerHotelImg from "@/images/docker/foundations/vm-vs-container-hotel.jpg";
import clientServerArchImg from "@/images/docker/foundations/client-server-architecture.jpg";
import dockerMacWindowsImg from "@/images/docker/foundations/docker-mac-windows-architecture.jpg";
import helloWorldWalkthroughImg from "@/images/docker/foundations/hello-world-walkthrough.jpg";

export type FoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: "container" | "layers" | "terminal";
  lessons: LessonContent[];
};

const whyDockerExists: LessonContent = {
  slug: "why-docker-exists",
  title: "Why Docker Exists",
  subtitle:
    "The pain that made Docker inevitable, and the standardized box that fixes it.",
  sections: [
    {
      kind: "prose",
      heading: "The pain everyone eventually hits",
      body: [
        "You build a Python data pipeline on your laptop. It works perfectly. You push it to the staging server, and it crashes with a cryptic error about `libssl` versions. You spend the next four hours discovering the server runs Ubuntu 20.04 while your laptop runs macOS with a different OpenSSL build. The fix turns out to be a single `apt-get install` command. Finding that out cost you half a day.",
        "This is the problem Docker solves. Not by being clever. By being brutally consistent.",
      ],
    },
    {
      kind: "prose",
      body: [
        "**Docker packages your application along with everything it needs to run** into a single, portable unit called a **container**. That container runs identically on your laptop, your teammate's machine, the CI server, and production. Same OS libraries. Same runtime version. Same file paths. Same everything.",
      ],
    },
    {
      kind: "image",
      src: containerPackageImg,
      alt: "Layers of a container package: application code, runtime, libraries, and config",
      caption: "Code, runtime, libraries, and config, sealed into one standardized unit",
    },
        {
      kind: "prose",
      heading: "What exactly are we talking about?",
      body: [
        "Before diving deeper, we need to clarify three terms that get thrown around interchangeably but mean very different things: Docker, Images, and Containers.",
      ],
    },
    {
      kind: "prose",
      heading: "What is Docker?",
      body: [
        "**Docker** is the platform itself. It is the set of tools (the engine, the command-line interface, the background services) that allows you to build, run, and manage containerized applications. When someone says 'I use Docker', they mean they use this platform to run their software.",
      ],
    },
    {
      kind: "prose",
      heading: "What is an Image?",
      body: [
        "An **Image** is a read-only template. It contains everything your application needs to run: the source code, the runtime (like Node.js or Python), the libraries, the environment variables, and the configuration files. It is the blueprint. Once you build an image, it never changes.",
      ],
    },
    {
      kind: "prose",
      heading: "What is a Container?",
      body: [
        "A **Container** is a running instance of an image. If an image is the class definition in programming, the container is the instantiated object. If an image is a recipe, the container is the cake you baked from it. You can start, stop, delete, and run multiple containers from a single image.",
      ],
    },
    {
      kind: "prose",
      heading: "The analogy: shipping containers",
      body: [
        "Before standardized shipping containers arrived in the 1950s, loading cargo onto ships was a nightmare. Every item had a different shape, size, and fragility. Workers manually stacked barrels next to crates next to bags. It was slow, expensive, and things broke constantly.",
        "Then Malcolm McLean introduced the intermodal shipping container: a standard metal box. It did not matter what was inside. The box was always the same dimensions, so cranes, trucks, and ships could all handle it with identical equipment.",
        "Docker is that standardized box for software. It does not care if your app is a Python script, a Node.js API, or a PostgreSQL database. It wraps it in a standard format that any Docker-compatible system can run without asking whether it has the right dependencies installed.",
      ],
    },
    {
      kind: "image",
      src: whyDockerExistsImg,
      alt: "Why Docker exists: inconsistent environments before Docker, and the standardized container solution",
      caption: "The problem before Docker, and the shape of the fix",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Key insight",
      body: "Docker does not eliminate complexity. It moves the complexity from runtime surprises to build-time declarations. You explicitly define what your application needs in a Dockerfile, and Docker guarantees that environment wherever the container runs.",
    },
    {
      kind: "takeaways",
      items: [
        "Environment drift, not bad code, causes most \"works on my machine\" failures.",
        "A container bundles your app with its runtime, libraries, and config so it behaves identically everywhere.",
        "Docker did not invent portability. It borrowed the idea from standardized shipping containers.",
        "Complexity does not disappear. It moves from unpredictable runtime surprises to explicit, versioned build-time declarations.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "why-docker-cause",
          question: "What actually causes most \"works on my machine\" failures?",
          options: [
            "Bad code written by the developer",
            "Small differences between environments, like OS or library versions",
            "Slow internet connections",
            "Using the wrong text editor",
          ],
          correctIndex: 1,
          explanation:
            "Environment drift between laptop, CI, and production is the real culprit. Docker's whole job is eliminating that drift.",
        },
        {
          id: "why-docker-bundle",
          question: "What does a Docker container actually bundle together?",
          options: [
            "Only your application source code",
            "Your application plus its runtime, libraries, and configuration",
            "A full guest operating system",
            "Just the Dockerfile itself",
          ],
          correctIndex: 1,
          explanation:
            "A container is your app plus everything it needs to run, packaged as one portable unit.",
        },
      ],
    },
  ],
};

const containersVsVms: LessonContent = {
  slug: "containers-vs-vms",
  title: "Containers vs Virtual Machines",
  subtitle:
    "Two different answers to \"how do I isolate my app,\" and why one of them won.",
  sections: [
    {
      kind: "prose",
      heading: "Before containers, there were VMs",
      body: [
        "Before containers, the standard answer to \"it works on my machine\" was the virtual machine. To understand why containers won, it helps to see what VMs actually cost.",
      ],
    },
    {
      kind: "image",
      src: containerRevolutionImg,
      alt: "Traditional virtual machines stack compared to Docker containers stack",
      caption: "Traditional VMs vs Docker containers, stacked side by side",
    },
    {
      kind: "prose",
      heading: "Virtual machines",
      body: [
        "A VM emulates an entire computer. It runs a full guest operating system (like Ubuntu, CentOS, or Windows) on top of a **hypervisor** like VMware, VirtualBox, or Hyper-V, which itself sits on your host OS. Each VM gets its own kernel, its own filesystem, its own memory allocation.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "The VM stack",
      code: `┌─────────────────────────────────────┐
│           Your Application          │
├─────────────────────────────────────┤
│          Guest OS (Ubuntu)          │  ← Full operating system (~2 GB)
├─────────────────────────────────────┤
│        Hypervisor (VMware)          │
├─────────────────────────────────────┤
│        Host OS (Windows/Mac)        │
├─────────────────────────────────────┤
│            Hardware                 │
└─────────────────────────────────────┘`,
    },
    {
      kind: "prose",
      body: [
        "**The problem:** each VM carries an entire OS along for the ride. A Python script that needs 50 MB of dependencies ends up sitting inside a 2 GB virtual machine. Boot times are measured in minutes. Running five VMs means running five separate operating systems.",
      ],
    },
    {
      kind: "prose",
      heading: "Containers",
      body: [
        "Containers take a fundamentally different approach. Instead of virtualizing hardware and running a full OS, they share the host OS kernel and isolate only the application layer.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "The container stack",
      code: `┌────────┐ ┌────────┐ ┌────────┐
│ App A  │ │ App B  │ │ App C  │
├────────┤ ├────────┤ ├────────┤
│ Libs A │ │ Libs B │ │ Libs C │
├────────┴─┴────────┴─┴────────┤
│        Docker Engine          │
├───────────────────────────────┤
│     Host OS (Linux Kernel)    │
├───────────────────────────────┤
│          Hardware             │
└───────────────────────────────┘`,
    },
    {
      kind: "animation",
      variant: "docker-vm-vs-container",
      caption: "VMs boot a full guest OS. Containers share the host kernel and start in seconds.",
    },
    {
      kind: "table",
      caption: "The result, side by side",
      headers: ["Aspect", "Virtual Machine", "Container"],
      rows: [
        ["Boot time", "Minutes", "Seconds"],
        ["Size", "Gigabytes", "Megabytes"],
        ["OS overhead", "Full guest OS per VM", "Shared host kernel"],
        ["Isolation", "Strong (separate kernel)", "Process-level (shared kernel)"],
        ["Resource usage", "Heavy", "Lightweight"],
        ["Density", "~10 to 20 per host", "Hundreds per host"],
      ],
    },
    {
      kind: "prose",
      heading: "The analogy: apartments vs houses",
      body: [
        "Virtual machines are like standalone houses. Each house has its own foundation, plumbing, wiring, and roof. Even if you just need one room, you still build and maintain an entire house.",
        "Containers are like apartments in a building. Every unit shares the building's foundation, elevator, and utilities. Each tenant gets a private space, but the infrastructure underneath is shared. You can fit far more tenants in an apartment building than houses on the same plot of land.",
      ],
    },
    {
      kind: "image",
      src: vmVsContainerHotelImg,
      alt: "VMs as separate houses vs containers as hotel rooms sharing one foundation",
      caption: "Standalone houses vs a shared building: the isolation trade-off in one picture",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "When to still reach for VMs",
      body: "If you need to run a completely different operating system (Windows on a Linux host, for instance) or you need the strongest possible isolation for security-critical multi-tenant workloads, VMs are still the right answer. But for most application deployment scenarios, containers win.",
    },
    {
      kind: "takeaways",
      items: [
        "A VM virtualizes hardware and boots a full guest OS. A container virtualizes the app layer and shares the host kernel.",
        "That difference is why containers boot in seconds and measure in megabytes, while VMs boot in minutes and measure in gigabytes.",
        "Houses vs apartments: VMs are standalone, containers share a foundation.",
        "VMs still win when you need a different OS entirely or the strongest possible isolation.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "vms-boot",
          question: "Why do containers typically start in seconds while VMs take minutes?",
          options: [
            "Containers use faster hard drives",
            "Containers skip booting a guest OS and start as a process on the shared kernel",
            "VMs always run on slower hardware",
            "Containers are pre-warmed by Docker Hub",
          ],
          correctIndex: 1,
          explanation:
            "A VM has to boot an entire operating system before your app can run. A container just starts a process, since the kernel is already running on the host.",
        },
        {
          id: "vms-still-win",
          question: "When is a VM still the better choice over a container?",
          options: [
            "When you want a smaller footprint",
            "When you need to run a different OS entirely or need the strongest possible isolation",
            "When you want faster boot times",
            "Never, containers always win",
          ],
          correctIndex: 1,
          explanation:
            "VMs isolate at the hardware level with a separate kernel, which is still the right tool for running a different OS or for hard multi-tenant security boundaries.",
        },
      ],
    },
  ],
};

const dockerArchitecture: LessonContent = {
  slug: "docker-architecture",
  title: "Docker Architecture",
  subtitle:
    "Client, daemon, registry: the three parts that turn \"docker run\" into a running container.",
  sections: [
    {
      kind: "prose",
      heading: "Docker is not one program",
      body: [
        "Docker is not a single magical binary. It is a client-server architecture with a few distinct moving parts. Understanding them will save you hours of confusion as you go deeper.",
      ],
    },
    {
      kind: "image",
      src: clientServerArchImg,
      alt: "Docker client sending REST API requests to the Docker daemon, which manages images, containers, volumes, and networks",
      caption: "Client sends REST requests. Daemon manages images, containers, volumes, and networks.",
    },
    {
      kind: "prose",
      heading: "The three core components",
      body: [
        "**Docker Client** (`docker`) is the command-line tool you actually type into. When you run `docker run`, `docker build`, or `docker ps`, you are talking to the client. It does not do any heavy lifting itself. It sends your instructions to the Docker daemon over a REST API.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Everything you type goes through the client",
      code: `# These are all Docker Client commands
docker run nginx
docker build -t myapp .
docker ps
docker logs my-container`,
    },
    {
      kind: "prose",
      body: [
        "**Docker Daemon** (`dockerd`) is the background service that does the real work. It manages images, containers, networks, and volumes, and executes whatever the client asks. On Linux it runs as a systemd service. On Mac and Windows it runs inside a lightweight Linux VM managed by Docker Desktop, because containers need a Linux kernel.",
        "**Docker Registry** is a storage and distribution system for images. Docker Hub is the default public registry, essentially GitHub for container images. Run `docker pull nginx` and the daemon fetches that image from Docker Hub. Private registries (like Amazon ECR, Google Artifact Registry, Azure Container Registry, or a self-hosted option) all work the same way.",
      ],
    },
    {
      kind: "prose",
      heading: "How a docker run command actually flows",
      body: [
        "Trace what happens the moment you type `docker run -d -p 8080:80 nginx`:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "From keystroke to running process",
      code: `Docker Client parses your command
Client sends a REST API request to Docker Daemon
Daemon checks if the "nginx" image exists locally
If not found locally, Daemon pulls it from Docker Hub
Daemon creates a new container from the image
Daemon allocates a read-write filesystem layer
Daemon creates a network interface and assigns an IP
Daemon maps port 8080 on host to port 80 in container
Daemon starts the container process (nginx, in this case)
Daemon returns the container ID to the Client`,
    },
    {
      kind: "animation",
      variant: "docker-client-server",
      caption: "CLI to REST API to daemon to images, containers, volumes, networks",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The daemon is the brain",
      body: "The client is just the messenger. This is why remote Docker daemons, Docker over SSH, and GUI tools like Portainer all work: they talk to the same daemon API the CLI does.",
    },
    {
      kind: "takeaways",
      items: [
        "Docker is a client-server system: the client sends commands, the daemon does the work.",
        "The daemon (dockerd) manages every Docker object: images, containers, networks, and volumes.",
        "Registries like Docker Hub store and distribute images. `docker pull` fetches from one.",
        "A single `docker run` triggers a ten-step round trip from client to daemon to registry to running process.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "arch-daemon",
          question: "What actually creates and runs the container when you type `docker run`?",
          options: [
            "The Docker Client, directly",
            "The Docker Daemon, after receiving the request from the client",
            "Docker Hub",
            "Your operating system's shell",
          ],
          correctIndex: 1,
          explanation:
            "The client only sends a REST API request. The daemon is the process that actually pulls images and creates containers.",
        },
        {
          id: "arch-registry",
          question: "What is Docker Hub?",
          options: [
            "A command-line flag for `docker run`",
            "The default public registry that stores and distributes Docker images",
            "A replacement for the Docker daemon",
            "A monitoring dashboard for running containers",
          ],
          correctIndex: 1,
          explanation:
            "Docker Hub is a registry (a place where images live). `docker pull` and `docker push` talk to a registry like Docker Hub or a private one.",
        },
      ],
    },
  ],
};

const installingDocker: LessonContent = {
  slug: "installing-docker",
  title: "Installing Docker",
  subtitle:
    "Getting the daemon running and the client on your PATH, on whatever OS you use.",
  sections: [
    {
      kind: "prose",
      heading: "One goal, three paths",
      body: [
        "Installation varies by operating system, but the goal is identical everywhere: get the Docker daemon running and the `docker` client on your PATH.",
      ],
    },
    {
      kind: "image",
      src: dockerMacWindowsImg,
      alt: "Docker Desktop architecture on Mac and Windows, showing the Linux VM and Docker Engine underneath",
      caption: "Docker Desktop on Mac and Windows: same experience, different backend underneath",
    },
    {
      kind: "prose",
      heading: "macOS",
      body: [
        "Docker Desktop is the standard path on a Mac. It bundles the CLI, the daemon, and a lightweight Linux VM, since macOS cannot run Linux containers natively.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "macOS install",
      code: `# Option 1: Docker Desktop (recommended for beginners)
# Download from https://www.docker.com/products/docker-desktop

# Option 2: Homebrew
brew install --cask docker

# After installation, verify:
docker --version
# Docker version 27.x.x, build xxxxxxx

docker run hello-world
# Should print "Hello from Docker!" and explain what just happened`,
    },
    {
      kind: "prose",
      heading: "Linux (Ubuntu / Debian)",
      body: [
        "On Linux you install Docker Engine directly (no VM required) since the host already runs a Linux kernel.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Linux install",
      code: `# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
  https://download.docker.com/linux/ubuntu \\
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# (Optional) Run Docker without sudo
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect

# Verify
docker run hello-world`,
    },
    {
      kind: "prose",
      heading: "Windows",
      body: [
        "On Windows, Docker Desktop uses WSL2 to get a real Linux kernel under the hood.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Windows install",
      code: `# Option 1: Docker Desktop (requires WSL2)
# Download from https://www.docker.com/products/docker-desktop
# Enable WSL2 backend during installation

# Option 2: Using winget
winget install Docker.DockerDesktop

# Verify in PowerShell
docker --version
docker run hello-world`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Skip Docker Desktop on Linux",
      body: "If you are on Linux, install Docker Engine directly instead of Docker Desktop. Docker Desktop on Linux adds an unnecessary VM layer you do not need, since the host kernel already handles containers natively. On Mac and Windows, Docker Desktop is the right call because Docker needs a Linux kernel to run containers at all.",
    },
    {
      kind: "takeaways",
      items: [
        "Every install, on every OS, ends with the same goal: a running daemon and the client on your PATH.",
        "Mac and Windows need Docker Desktop, which supplies a hidden Linux VM. Linux does not, since the kernel is already there.",
        "`docker run hello-world` is the universal sanity check that your install actually works.",
        "Never install Docker Desktop on Linux. Install Docker Engine directly and skip the unnecessary VM layer.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "install-mac-windows",
          question: "Why do Mac and Windows need Docker Desktop, while Linux does not?",
          options: [
            "Docker Desktop is required on every operating system",
            "Mac and Windows do not run a Linux kernel natively, so Docker Desktop supplies one via a lightweight VM",
            "Linux is not supported by Docker at all",
            "Docker Desktop is only a GUI, with no functional difference",
          ],
          correctIndex: 1,
          explanation:
            "Containers need a Linux kernel. Linux already has one. Mac and Windows do not, so Docker Desktop creates a small Linux VM to supply it.",
        },
        {
          id: "install-verify",
          question: "What command is the universal sanity check that your Docker install works?",
          options: [
            "docker --help",
            "docker run hello-world",
            "docker desktop start",
            "docker install verify",
          ],
          correctIndex: 1,
          explanation:
            "`docker run hello-world` pulls a tiny image, runs it, and prints a confirmation message, proving the client and daemon can both talk to each other.",
        },
      ],
    },
  ],
};

const yourFirstContainer: LessonContent = {
  slug: "your-first-container",
  title: "Your First Container",
  subtitle:
    "Stop reading, start running: from a one-off command to a web server you can visit.",
  sections: [
    {
      kind: "prose",
      heading: "Running a single command",
      body: ["Time to stop reading and start running things. The classic first step is the `hello-world` image."],
    },
    {
      kind: "terminal-animation",
      command: "docker run hello-world",
      output: `Unable to find image 'hello-world:latest' locally
              latest: Pulling from library/hello-world
              c1ec31eb5944: Pull complete 
              Digest: sha256:4bd78111b6914a99dbc560e6a20eab57ff6655aea4a80c50b0c5491968cbc2e6
              Status: Downloaded newer image for hello-world:latest
              
              Hello from Docker!
              This message shows that your installation appears to be working correctly.
              
              To generate this message, Docker took the following steps:
               1. The Docker client contacted the Docker daemon.
               2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
               3. The Docker daemon created a new container from that image which runs the executable that produces the output you are currently reading.
               4. The Docker daemon streamed that output to the Docker client, which sent it to your terminal.`,
                    buttonLabel: "Run Command",
                    caption: "Your first container",
    },
    {
      kind: "prose",
      body: [
        "Here is what just happened: Docker pulled the \`hello-world\` image from Docker Hub because it was not already cached locally. It then created a new container from that image, ran the executable inside it, printed the output, and stopped the container once the process finished.",
      ],
    },

    {
      kind: "prose",
      body: [
        "Here is what just happened: Docker pulled the `ubuntu` image from Docker Hub if it was not already cached, created a new container from that image, ran the `echo` command inside it, printed the output, then stopped the container once the process finished.",
      ],
    },
    {
      kind: "prose",
      heading: "Getting an interactive shell",
      body: [
        "Running a single command is fine, but sometimes you want to explore inside a container.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Interactive mode",
      code: `docker run -it ubuntu bash`,
    },
    {
      kind: "prose",
      body: [
        "The `-it` flags are a pair: `-i` keeps STDIN open so you can type, and `-t` allocates a pseudo-terminal so you get a proper prompt. Now you are inside a minimal Ubuntu environment.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Poking around inside",
      code: `root@a1b2c3d4e5f6:/# cat /etc/os-release
# Shows Ubuntu version info

root@a1b2c3d4e5f6:/# ls /
# Standard Linux file system

root@a1b2c3d4e5f6:/# apt-get update && apt-get install -y curl
# You can install packages, but they disappear when the container stops

root@a1b2c3d4e5f6:/# exit
# Back to your host machine`,
    },
    {
      kind: "prose",
      heading: "Running an actual web server",
      body: ["Something more practical. Run Nginx:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "docker run, for real this time",
      code: `docker run -d -p 8080:80 --name my-nginx nginx`,
    },
    {
      kind: "prose",
      body: [
        "Breaking this down: `-d` runs it in the background, in detached mode. `-p 8080:80` maps port 8080 on your machine to port 80 inside the container. `--name my-nginx` gives it a human-readable name you can reference later. `nginx` is simply the image to use.",
        "Now visit `http://localhost:8080` in your browser. That page is being served by Nginx, running inside a Docker container.",
      ],
    },
    {
      kind: "image",
      src: helloWorldWalkthroughImg,
      alt: "Step by step walkthrough from opening Docker Desktop to running hello-world in the terminal",
      caption: "The same flow, start to finish: open Docker Desktop, run the command, see the output",
    },
    {
      kind: "prose",
      heading: "Managing containers day to day",
      body: [
        "A handful of commands cover almost everything you will do with a running container.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Essential container commands",
      code: `# List running containers
docker ps

# List ALL containers (including stopped ones)
docker ps -a

# View container logs
docker logs my-nginx

# Follow logs in real-time (like tail -f)
docker logs -f my-nginx

# Execute a command inside a running container
docker exec -it my-nginx bash

# Stop a container gracefully
docker stop my-nginx

# Start a stopped container
docker start my-nginx

# Remove a stopped container
docker rm my-nginx

# Force remove a running container
docker rm -f my-nginx

# Remove all stopped containers
docker container prune`,
    },
    {
      kind: "callout",
      tone: "success",
      title: "You just ran your first containers",
      body: "One command downloaded an image, created an isolated process, and ran it (no manual dependency installation required). That is the entire pitch of Docker in one terminal session.",
    },
    {
      kind: "takeaways",
      items: [
        "`docker run` pulls the image if needed, creates a container, and starts it, in one step.",
        "`-it` gets you an interactive shell inside the container. `-d` runs it detached, in the background.",
        "`-p host:container` maps a port on your machine to a port inside the container.",
        "`docker ps`, `logs`, `exec`, `stop`, and `rm` cover most of your day-to-day container management.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "first-container-it",
          question: "What do the `-it` flags on `docker run` do together?",
          options: [
            "They run the container in the background",
            "They keep STDIN open and allocate a terminal, giving you an interactive shell",
            "They install extra tools inside the container",
            "They map a port to the host",
          ],
          correctIndex: 1,
          explanation:
            "`-i` keeps STDIN open so you can type, and `-t` allocates a pseudo-terminal so you get a usable prompt. Together they give you an interactive session.",
        },
        {
          id: "first-container-port",
          question: "In `docker run -d -p 8080:80 nginx`, what does `8080:80` mean?",
          options: [
            "Container port 8080 maps to host port 80",
            "Host port 8080 maps to container port 80",
            "The container will use 8080 MB of memory",
            "It sets the container's process ID to 8080",
          ],
          correctIndex: 1,
          explanation:
            "The format is `host:container`. Traffic to port 8080 on your machine gets forwarded to port 80 inside the container, where Nginx is listening.",
        },
      ],
    },
  ],
};

export const FOUNDATION_TOPICS: Record<string, FoundationTopicMeta> = {
  "what-is-docker": {
    slug: "what-is-docker",
    title: "Docker & Containers",
    category: "Foundations",
    iconKey: "container",
    blurb:
      "Why Docker exists, how it stacks up against VMs, how the pieces fit together, and how to get it running and start your first container.",
    lessons: [
      whyDockerExists,
      containersVsVms,
      dockerArchitecture,
      installingDocker,
      yourFirstContainer,
    ],
  },
};
