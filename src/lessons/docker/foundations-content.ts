import { type LessonContent, type Section } from "@/lessons/types";

export type { Section };

import containerPackageImg from "@/images/docker/foundations/container-package.jpg";
import whyDockerExistsImg from "@/images/docker/foundations/why-docker-exists.jpg";
import containerRevolutionImg from "@/images/docker/foundations/container-revolution.jpg";
import vmVsContainerHotelImg from "@/images/docker/foundations/vm-vs-container-hotel.jpg";
import dockerMacWindowsImg from "@/images/docker/foundations/docker-desktop-architecture.jpg";
import helloWorldWalkthroughImg from "@/images/docker/foundations/hello-world-walkthrough.jpg";
import dockerArchitectureImg from "@/images/docker/foundations/docker-architecture.jpg";
import dockerArchitectureAnalogyImg from "@/images/docker/foundations/docker-architecture-analogy.jpg";
import dockerDaemonImg from "@/images/docker/foundations/docker-daemon.jpg";
import containerdArchitectureImg from "@/images/docker/foundations/containerd-architecture.jpg";
import runcImg from "@/images/docker/foundations/runc.jpg";
import linuxNamespacesImg from "@/images/docker/foundations/linux-namespaces.jpg";
import linuxCgroupsImg from "@/images/docker/foundations/linux-cgroups.jpg";
import dockerIntroImg from "@/images/docker/foundations/docker-intro.jpg";
import dockerAnalogyImg from "@/images/docker/foundations/docker-analogy.jpg";
import dockerDesktopImg from "@/images/docker/foundations/docker-desktop.png";
import startupSequencesImg from "@/images/docker/foundations/startup-sequences.jpg";

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
      src: whyDockerExistsImg,
      alt: "Why Docker exists: inconsistent environments before Docker, and the standardized container solution",
      caption: "The problem before Docker, and the shape of the fix",
    },
    {
      kind: "prose",
      heading: "What exactly are we talking about?",
      body: [
        "Before diving deeper, we need to clarify three terms that get thrown around interchangeably but mean very different things: Docker, Images, and Containers.",
      ],
    },
    {
      kind: "image",
      src: dockerIntroImg,
      alt: "Overview of Docker and containerization",
      caption: "Build once. Run anywhere with Docker containers",
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
      src: dockerAnalogyImg,
      alt: "Docker shipping container analogy",
      caption: "Standardized containers for software, inspired by standardized containers for cargo.",
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
    "If you have ever felt like Docker is a bit of a black box, you are not alone. It looks like magic when you type docker run and a fully functioning application appears out of nowhere.",
  sections: [
    {
      kind: "prose",
      heading: "Docker is not one program",
      body: [
        "Under the hood, Docker is not a single giant program. It is an organized assembly line of specialized components working together. which you can see in the below image",
      ],
    },
    {
      kind: "image",
      src: dockerArchitectureImg,
      alt: "Docker architecture",
      caption: "Docker architecture",
    },
    {
      kind: "prose",
      heading: "Why is it built this way?",
      body: [
        "Every layer in Docker has a specific, isolated responsibility. Some components manage APIs, some manage container lifecycle operations, and others interact directly with the Linux kernel. This strict separation keeps the runtime modular, stable, and easier to maintain. If one piece needs an update or crashes, the other components can keep working smoothly without bringing the whole system down.",
      ],
    },
    {
      kind: "prose",
      heading: "The Restaurant Analogy",
      body: [
        "Think of Docker like ordering food at a restaurant. You (the customer) never walk into the kitchen and cook your own meal. You tell the waiter what you want, the waiter tells the kitchen, the kitchen tells the chef, and the chef actually cooks the food using the stove and ingredients. Docker works the same way. You type a command, and that request quietly travels through several \"staff members\" before a container actually starts running.",
      ],
    },
    {
      kind: "image",
      src: dockerArchitectureAnalogyImg,
      alt: "Docker architecture restaurant analogy",
      caption: "Docker architecture restaurant analogy",
    },
    {
      kind: "prose",
      heading: "Component by Component Breakdown",
      body: [
        "**1. Docker CLI, the User Interface**",
        "This is your entry point. When you open your terminal and type commands like `docker run`, `docker build`, or `docker ps`, you are talking directly to the CLI. It does not actually build or run containers itself; it simply translates your human commands into a structured API request and shoots it over `/var/run/docker.sock` to the Docker daemon.",
        "Because of this separation, the CLI and the daemon do not even need to be on the same machine. Docker can expose its API remotely, letting external tools and automation systems control the daemon from anywhere.",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "The CLI is the customer who walks up and places an order. You do not cook anything or go near the kitchen, you just say what you want out loud, in this case by typing `docker run` or `docker ps`.",
    },
    {
      kind: "prose",
      body: [
        "**2. dockerd (The Docker Daemon)**",
        "The Docker Daemon (`dockerd`) is a persistent background process that sits and listens for incoming requests from the CLI.",
      ],
    },
    {
      kind: "image",
      src: dockerDaemonImg,
      alt: "Docker Daemon",
      caption: "Docker Daemon",
    },
    {
      kind: "prose",
      body: [
        "It acts as the high-level orchestration layer for your local operations, accepting requests via a REST API over a Unix socket or a network interface. It manages your networks, storage volumes, and images.",
        "However, `dockerd` does NOT run containers directly. Instead, it hands container lifecycle operations down to `containerd`. This architectural split keeps your containers running perfectly even if the Docker daemon restarts or crashes.",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "`dockerd` is the restaurant manager who takes your order, checks your ID if needed (security and isolation), and passes the ticket to the kitchen. They run the front of house, keep track of every table, dish, and ingredient in the building, but never actually cook a single thing themselves.",
    },
    {
      kind: "prose",
      body: [
        "**3. containerd (The Container Runtime Supervisor)**",
        "Once `dockerd` hands off a request via internal gRPC communication, `containerd` takes charge of supervising the container lifecycle.",
      ],
    },
    {
      kind: "image",
      src: containerdArchitectureImg,
      alt: "containerd Architecture",
      caption: "containerd Architecture",
    },
    {
      kind: "prose",
      body: [
        "It handles the core runtime operations: pulling images, managing storage snapshots, unpacking images, and supervising execution.",
        "Once `dockerd` delegates the task to start a container, it mostly steps out of the way, leaving `containerd` in control. Since `containerd` is often busy running multiple containers at once, it does not personally monitor and manage the lifecycle of every single container. Instead, it hands the job off to a dedicated shim per container.",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "`containerd` is the kitchen manager who receives the ticket from the front of house and decides how the meal gets made. They manage the pantry (pulling images), track which ingredients are already prepped (snapshots and layers), and decide when a dish should start or stop, but they are too busy running the whole kitchen to stand over one pan themselves.",
    },
    {
      kind: "prose",
      body: [
        "**4. containerd-shim (The Head Chef Assistant per Dish)**",
        "This is the most underrated part of the whole system, and honestly the coolest one. For every single container you run, `containerd` creates one dedicated shim process just for that container.",
        "Why does this matter? Because once `runc` actually starts the container, `runc` exits immediately. It does its job and leaves. If nothing stuck around, the container process would become an orphan with no one managing its input, output, or signals.",
        "The shim stays behind, keeps STDIO (input and output) open, forwards signals like stop or kill, and reports status back up to `containerd`. If `containerd` crashes or undergoes an upgrade, the shim keeps the connection alive and the container running completely uninterrupted.",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "`containerd-shim` is the personal waiter assigned to just your table for the entire meal. The head chef cooks your dish and immediately walks away, so this waiter stays behind to keep your food warm, bring refills when you ask, and let the kitchen manager know if you finish or send something back.",
    },
    {
      kind: "prose",
      body: [
        "**5. runc, the OCI Runtime**",
        "`containerd-shim` asks `runc` to actually build and start the container by executing it. `runc` is a lightweight, low-level tool that follows the OCI (Open Container Initiative) specification, which is basically a universal recipe book that all container tools agree to follow.",
      ],
    },
    {
      kind: "image",
      src: runcImg,
      alt: "runc",
      caption: "runc",
    },
    {
      kind: "prose",
      body: [
        "`runc` has one job: interact directly with the Linux kernel to create the container. It reads the container configuration file, sets up the filesystem boundaries, configures namespaces and cgroups, and kicks off the process.",
        "This is the exact layer where containers stop behaving like abstract Docker objects and become ordinary Linux processes. The moment the process goes live, `runc` exits immediately. Its job is complete, leaving the shim behind to supervise the container and report its status back up to `containerd`.",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "`runc` is the head chef who actually cooks the dish following a strict universal recipe book that every restaurant in the chain uses. Once the dish is plated and handed off, the chef walks straight back to the kitchen and does not linger at your table.",
    },
    {
      kind: "prose",
      body: [
        "**6. The Linux Kernel**",
        "This is where the actual isolation happens. The kernel uses core operating system features to build the sandbox walls around the ordinary process that `runc` kicked off:",
      ],
    },
    {
      kind: "prose",
      body: [
        "* **Namespaces (pid, net, mnt, ipc, uts):** Provide the illusion of a dedicated operating system by isolating process IDs (pid), network interfaces (net), mount points (mnt), and file systems.",
      ]
    },
    {
      kind: "image",
      src: linuxNamespacesImg,
      alt: "Linux Namespaces",
      caption: "Linux Namespaces",
    },
    {
      kind: "prose",
      body: [
        "* **Cgroups (Control Groups):** Enforce strict resource limits, making sure a single container cannot hog all of your CPU, memory, or I/O.",
      ]
    },
    {
      kind: "image",
      src: linuxCgroupsImg,
      alt: "Linux Cgroups",
      caption: "Linux Cgroups",
    },
    {
      kind: "prose",
      body: [
        "* **Capabilities and security modules (Seccomp, AppArmor, SELinux):** restrict what the container is allowed to touch, like kitchen safety rules.\n* **Union filesystem:** lets container images be built from layered, reusable pieces, like stacking pre-made sauces instead of remaking them from scratch every time.\n\nContainers are not tiny virtual machines. They are just regular Linux processes with strict boundaries drawn around them using these kernel features.",
      ],
    },
    {
      kind: "prose",
      heading: "The End-to-End Flow: Running a Container",
      body: [
        "Let us trace exactly what happens when you hit Enter on `$ docker run nginx`:",
      ],
    },
    {
      kind: "terminal-animation",
      command: "docker run nginx",
      output: `Step A: The Request
1. You type the command in the Docker CLI.
2. The CLI packages this into a REST API request and sends it to dockerd via a Unix socket (like /var/run/docker.sock on Linux).
Step B: The Hand-off
1. dockerd receives the request, verifies it, and tells containerd via gRPC that a new container needs to be supervised.
2. containerd handles the image layers. If you do not have the Nginx image locally, it reaches out to the registry to pull it.
Step C: The Creation
1. containerd spins up a containerd-shim dedicated to this specific container instance.
2. The shim invokes runc to execute the task.
3. runc talks to the Linux Kernel, configuring the namespaces and cgroups needed to sandbox the process.
Step D: The Steady State
1. The Nginx process starts inside its isolated environment.
2. runc exits, leaving containerd-shim in charge of monitoring the alive process.
3. A success status ripples back up the chain: from the shim, to containerd, to dockerd, and finally to your terminal screen via the CLI.`,
      buttonLabel: "Trace Execution",
      caption: "End-to-End Execution Trace",
    }
  ],
};

const settingUpDocker: LessonContent = {
  slug: "setting-up-docker",
  title: "Setting Up Docker",
  subtitle:
    "Understand Docker Desktop, prepare your environment, and install Docker on your operating system.",
  sections: [
    {
      kind: "prose",
      heading: "One Goal, Three Different Setups",
      body: [
        "No matter which operating system you use, the goal is exactly the same: install the **Docker CLI**, get the **Docker Engine** running, and verify everything works before running your first container.",
        "The difference lies in **how** each operating system reaches that goal. Linux can run Docker Engine directly because it already provides the Linux kernel that containers depend on. macOS and Windows cannot, so they rely on **Docker Desktop** to provide that environment.",
      ],
    },
    {
      kind: "image",
      src: dockerMacWindowsImg,
      alt: "Docker Desktop architecture on Mac and Windows compared with Docker Engine running directly on Linux",
      caption:
        "Same Docker experience, different setup underneath depending on your operating system.",
    },
    {
      kind: "prose",
      heading: "What is Docker Desktop?",
      body: [
        "If you're using **macOS** or **Windows**, the first thing you'll install isn't Docker Engine directly—it's **Docker Desktop**.",
        "**Docker Desktop** is the official application that bundles everything needed to build, run, and manage containers. Instead of installing multiple tools individually, Docker Desktop packages them into a single application that's easy to install and maintain.",
        "It includes the **Docker CLI**, **Docker Engine**, **Docker Compose**, and a graphical dashboard for managing containers, images, volumes, and networks.",
      ],
    },
    {
      kind: "image",
      src: dockerDesktopImg,
      alt: "Docker Desktop overview showing its major components and hidden Linux virtual machine",
      caption:
        "Docker Desktop bundles everything needed to build, run, and manage containers.",
    },
    {
      kind: "prose",
      heading: "Why Does Docker Desktop Exist?",
      body: [
        "Containers aren't virtual machines—they're isolated Linux processes that rely on Linux kernel features such as **namespaces** and **cgroups**.",
        "Because **macOS** and **Windows** don't include a Linux kernel, they can't run Linux containers directly. Docker Desktop solves this by providing the Linux environment Docker Engine needs while hiding all of the complexity behind a familiar desktop application.",
        "If you're on **Linux**, Docker Desktop usually isn't necessary because Docker Engine can run directly on the host operating system.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Linux vs macOS & Windows",
      body: "Linux installs **Docker Engine** directly. macOS and Windows install **Docker Desktop**, which provides the Linux environment required to run containers.",
    },
    {
      kind: "prose",
      heading: "Before You Run Your First Docker Command",
      body: [
        "Installing Docker Desktop is only the first step. Before any Docker command can work, the **Docker Engine** must be running.",
        "When you launch Docker Desktop, it automatically prepares everything required before containers can start. Once the startup process completes, Docker is ready to accept commands from the Docker CLI.",
        "The infographic below shows the high-level startup sequence. Don't worry about understanding every component yet—you'll learn how everything works internally in the **Docker Architecture** lesson.",
      ],
    },
    {
      kind: "image",
      src: startupSequencesImg,
      alt: "Docker Desktop startup sequence",
      caption:
        "Behind the scenes, Docker Desktop prepares everything before the engine is ready to run containers.",
    },
    {
      kind: "prose",
      heading: "The Golden Rule",
      body: [
        "The **Docker CLI** is only a client—it sends commands to the **Docker Engine**.",
        "If Docker Desktop hasn't finished starting, the engine isn't running yet, so the CLI has nothing to communicate with. This is one of the most common mistakes beginners encounter.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "What happens when Docker Engine isn't running",
      code: `$ docker ps
      
Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Always Start Docker Desktop First",
      body: "Before opening your terminal and running Docker commands, make sure Docker Desktop has fully started and the Docker Engine is running. Once it's ready, every Docker command will work normally.",
    },
    {
      kind: "callout",
      tone: "success",
      title: "Ready to Install?",
      body:
        "Now that you understand what Docker Desktop is and why it's needed, let's install Docker on your operating system.",
    },
    {
      kind: "prose",
      heading: "macOS",
      body: [
        "**Docker Desktop** is the recommended way to use Docker on macOS. It installs the Docker CLI, Docker Engine, Docker Compose, and manages the lightweight Linux environment automatically.",
        "After installing Docker Desktop, launch the application and wait until the Docker whale icon indicates that the engine is running before opening your terminal.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Install Docker on macOS",
      code: `# Option 1: Download Docker Desktop (Recommended)
            # https://www.docker.com/products/docker-desktop
            
            # Option 2: Install using Homebrew
            brew install --cask docker
            
            # Launch Docker Desktop
            
            # Verify Docker is available
            docker --version
            
            # Verify the Docker Engine is running
            docker version`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why Doesn't Homebrew Start Docker?",
      body: "Homebrew installs the Docker Desktop application, but it doesn't automatically launch it. After installation, open Docker Desktop once so it can start the Docker Engine in the background.",
    },

    {
      kind: "prose",
      heading: "Linux (Ubuntu / Debian)",
      body: [
        "Linux is different because it already provides the Linux kernel that containers rely on. Instead of installing Docker Desktop, you install **Docker Engine** directly on the host operating system.",
        "Since there is no hidden virtual machine involved, Docker Engine communicates directly with your Linux kernel, making the setup simpler and more lightweight.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Install Docker Engine on Ubuntu / Debian",
      code: `# Remove old versions
      sudo apt-get remove docker docker-engine docker.io containerd runc
      
      # Install prerequisites
      sudo apt-get update
      sudo apt-get install ca-certificates curl gnupg
      
      # Create Docker keyring
      sudo install -m 0755 -d /etc/apt/keyrings
      
      # Download Docker's official GPG key
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\
      sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      
      # Add Docker repository
      echo \\
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
      https://download.docker.com/linux/ubuntu \\
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
      # Install Docker Engine
      sudo apt-get update
      sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      
      # (Optional) Allow Docker without sudo
      sudo usermod -aG docker $USER
      
      # Log out and back in
      
      # Verify installation
      docker --version
      docker version`,
    },
    {
      kind: "callout",
      tone: "success",
      title: "Linux Users",
      body: "Unlike macOS and Windows, Linux doesn't require Docker Desktop because Docker Engine can run directly on the host operating system.",
    },

    {
      kind: "prose",
      heading: "Windows",
      body: [
        "On Windows, Docker Desktop uses **WSL 2 (Windows Subsystem for Linux)** to provide a real Linux kernel for running containers.",
        "As with macOS, simply installing Docker Desktop isn't enough—you must start the application and wait for the Docker Engine to finish starting before using Docker commands.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Install Docker on Windows",
      code: `# Option 1: Download Docker Desktop
      # https://www.docker.com/products/docker-desktop
      
      # Option 2: Install using winget
      winget install Docker.DockerDesktop
      
      # Enable the WSL2 backend during installation
      
      # Launch Docker Desktop
      
      # Verify installation
      docker --version
      docker version`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "WSL2 Required",
      body: "Docker Desktop uses WSL2 as its Linux backend on Windows. If WSL2 isn't installed, Docker Desktop will guide you through enabling it during setup.",
    },
        {
      kind: "prose",
      heading: "Verifying Your Installation",
      body: [
        "Installing Docker is only half the job—you also need to verify that everything is working correctly. The quickest way to do this is by checking the Docker client, confirming the Docker Engine is running, and finally launching your very first container.",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "Verify your Docker installation",
      code: `# Verify the Docker CLI
docker --version

# Verify the Docker Engine
docker version

# Run your first container
docker run hello-world`,
    },
    {
      kind: "prose",
      body: [
        "If **hello-world** runs successfully, Docker automatically downloads the image (if necessary), creates a container, runs it, prints a welcome message, and exits. This confirms that your Docker CLI can communicate with the Docker Engine and that your environment is ready for the rest of this course.",
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "Setup Complete!",
      body: "Congratulations! Your Docker environment is now fully configured. You've successfully installed Docker, started the Docker Engine, and verified that containers can run correctly.",
    },
    {
      kind: "prose",
      heading: "Common Setup Issues",
      body: [
        "If something doesn't work, don't panic. Most Docker setup problems are caused by one of a handful of common issues and are usually easy to fix.",
      ],
    },
    {
      kind: "table",
      caption: "Common installation problems",
      headers: ["Problem", "Likely Cause", "Solution"],
      rows: [
        [
          "Cannot connect to the Docker daemon",
          "Docker Engine isn't running",
          "Start Docker Desktop and wait until it's fully initialized.",
        ],
        [
          "docker: command not found",
          "Docker CLI isn't installed or isn't on your PATH",
          "Reinstall Docker Desktop or Docker Engine and restart your terminal.",
        ],
        [
          "permission denied while trying to connect to the Docker daemon socket",
          "Your Linux user isn't in the docker group",
          "Run 'sudo usermod -aG docker $USER' and log out and back in.",
        ],
        [
          "Docker Desktop won't start",
          "Virtualization or WSL2 isn't enabled",
          "Enable virtualization (Intel VT-x / AMD-V) or install WSL2 as prompted.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Don't Memorize Everything",
      body: "At this stage, your goal isn't to memorize every command or installation step. Simply understand what Docker Desktop does, why Linux installs Docker differently, and verify that your environment is working correctly. You'll use Docker every lesson from here on, so the commands will quickly become second nature.",
    },
    {
      kind: "takeaways",
      items: [
        "Docker Desktop is the easiest way to run Docker on macOS and Windows.",
        "Linux installs Docker Engine directly because it already provides the Linux kernel.",
        "The Docker CLI sends commands to the Docker Engine, so the engine must be running before Docker commands will work.",
        "Always wait for Docker Desktop to finish starting before opening your terminal.",
        "`docker run hello-world` is the quickest way to verify your Docker environment is working correctly.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "setup-docker-desktop",
          question: "Why do macOS and Windows use Docker Desktop instead of Docker Engine directly?",
          options: [
            "Docker Engine only works with graphical interfaces.",
            "macOS and Windows don't include a Linux kernel, so Docker Desktop provides the Linux environment containers need.",
            "Docker Desktop makes containers faster than Linux.",
            "Docker Engine has been discontinued.",
          ],
          correctIndex: 1,
          explanation:
            "Containers depend on Linux kernel features such as namespaces and cgroups. Docker Desktop provides that Linux environment on macOS and Windows.",
        },
        {
          id: "setup-engine-running",
          question: "Why must Docker Desktop be running before executing Docker commands?",
          options: [
            "The Docker CLI starts Docker Engine automatically.",
            "The Docker CLI communicates with Docker Engine, so the engine must already be running.",
            "Docker commands only work when the dashboard is open.",
            "Docker Desktop compiles Docker commands before running them.",
          ],
          correctIndex: 1,
          explanation:
            "The Docker CLI is simply a client. It sends requests to Docker Engine. If the engine isn't running, the CLI has nothing to communicate with.",
        },
        {
          id: "setup-verification",
          question: "Which command is commonly used to verify that Docker can successfully run containers?",
          options: [
            "docker build",
            "docker images",
            "docker run hello-world",
            "docker inspect",
          ],
          correctIndex: 2,
          explanation:
            "`docker run hello-world` downloads a small image (if necessary), creates a container, runs it, and prints a success message, confirming that your Docker installation is working correctly.",
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
58dee6a49ef1: Pull complete 
c3bdf82c34d1: Download complete 
Digest: sha256:96498ffd522e70807ab6384a5c0485a79b9c7c08ca79ba08623edcad1054e62d
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (arm64v8)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/`,
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
        "Breaking this down: **`-d`** runs it in the background, in detached mode. **`-p 8080:80`** maps port 8080 on your machine to port 80 inside the container. **`--name my-nginx`** gives it a human-readable name you can reference later. **`nginx`** is simply the image to use.",
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
      settingUpDocker,
      yourFirstContainer,
    ],
  },
};
