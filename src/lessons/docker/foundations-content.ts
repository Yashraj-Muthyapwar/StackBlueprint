import { type LessonContent, type Section } from "@/lessons/types";

export type { Section };

import whyDockerExistsImg from "@/images/docker/foundations/why-docker-exists.jpg";
import containerRevolutionImg from "@/images/docker/foundations/container-revolution.jpg";
import vmVsContainerHotelImg from "@/images/docker/foundations/containers-vs-vm.jpg";
import dockerMacWindowsImg from "@/images/docker/foundations/docker-desktop-architecture.jpg";
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
import dockerDesktopHelloWorldImg from "@/images/docker/foundations/docker-desktop-hello-world.jpg";
import howDockerWorksImg from "@/images/docker/foundations/how-docker-works.jpg";

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
      heading: "The Big Picture",
      body: [
        "Now that you know what Docker, images, and containers are, it's helpful to see how they fit together at a high level. Don't worry about understanding every component yet this diagram is simply a preview of the journey your application takes from your machine to a running container. We'll revisit every part of this architecture in detail later.",
      ],
    },
    {
      kind: "image",
      src: howDockerWorksImg,
      alt: "Overview of how Docker works",
      caption: "How Docker works at a high level.",
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
          id: "why-docker-cause-easy",
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
          id: "why-docker-bundle-medium-1",
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
        {
          id: "why-docker-image-vs-container-medium-2",
          question: "If an image is the blueprint, what is the container?",
          options: [
            "The compiler that builds the image",
            "The running instance instantiated from the image",
            "A virtual machine running the image",
            "The registry where the blueprint is stored",
          ],
          correctIndex: 1,
          explanation:
            "A container is a live, running instance of a read-only image.",
        },
        {
          id: "why-docker-engine-hard-1",
          question: "Which of the following correctly describes 'Docker' as a platform versus a 'Container'?",
          options: [
            "Docker is the operating system; a container is an application.",
            "Docker is the set of tools (engine, CLI) used to manage and run containers, while a container is the actual running application.",
            "Docker is a type of virtual machine, while a container is the hardware.",
            "Docker and container are exact synonyms.",
          ],
          correctIndex: 1,
          explanation:
            "Docker provides the tools and platform (like Docker Engine) to create and run containers, but the container itself is the standardized unit of software.",
        },
        {
          id: "why-docker-state-hard-2",
          question: "Why does building an application inside a container resolve the 'cryptic libssl version' issue?",
          options: [
            "Containers bypass SSL entirely, removing the need for the library.",
            "Containers enforce a standardized build-time declaration, ensuring the exact same library version runs everywhere.",
            "Containers automatically upgrade the host OS to the required library version.",
            "Containers use cloud-based libraries instead of local ones.",
          ],
          correctIndex: 1,
          explanation:
            "By declaring the environment at build-time within an image, Docker guarantees that the exact same dependencies (like libssl) are shipped and run everywhere.",
        }
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
    // {
    //   kind: "animation",
    //   variant: "docker-vm-vs-container",
    //   caption: "VMs boot a full guest OS. Containers share the host kernel and start in seconds.",
    // },
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
          id: "vms-boot-easy",
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
          id: "vms-still-win-medium-1",
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
        {
          id: "vms-hypervisor-medium-2",
          question: "What is the role of a hypervisor in a Virtual Machine architecture?",
          options: [
            "It runs the containerized processes directly",
            "It emulates physical hardware so multiple guest operating systems can run concurrently",
            "It manages Docker images and networks",
            "It acts as a firewall between the VM and the host OS",
          ],
          correctIndex: 1,
          explanation:
            "A hypervisor abstracts and provisions physical hardware resources (CPU, RAM, Disk) to allow multiple heavy Guest OSs to run independently.",
        },
        {
          id: "vms-isolation-hard-1",
          question: "How do containers achieve isolation without a hypervisor?",
          options: [
            "They use cloud-based execution",
            "They rely on the Docker Engine to emulate hardware",
            "They use Linux kernel features like namespaces and cgroups to isolate processes on a shared kernel",
            "They run on a hidden hypervisor installed by Docker",
          ],
          correctIndex: 2,
          explanation:
            "Containers do not emulate hardware. They use built-in Linux features (namespaces for visibility isolation, cgroups for resource limiting) to sandbox standard processes.",
        },
        {
          id: "vms-overhead-hard-2",
          question: "Which of the following is the primary cause of overhead in Virtual Machines compared to Containers?",
          options: [
            "Network latency caused by the hypervisor",
            "The duplication of the guest OS kernel and background system processes for every VM",
            "The time it takes to download VM images",
            "Containers compress data better than VMs",
          ],
          correctIndex: 1,
          explanation:
            "Every VM requires its own complete operating system (kernel, init system, background daemons). Running 10 VMs means running 10 operating systems, consuming massive amounts of RAM and CPU just to idle.",
        }
      ],
    },
  ],
};

const dockerArchitecture: LessonContent = {
  slug: "docker-architecture",
  title: "Docker Architecture",
  subtitle:
    "Why `docker run` feels like magic, and what's actually happening underneath.",
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
        "This is your entry point. When you open your terminal and type commands like `docker run`, `docker build`, or `docker ps`, you are talking directly to the CLI. It does not actually build or run containers itself; it simply translates your human commands into a structured API request and shoots it over `/var/run/docker.sock` to the Docker daemon. *(Note: This socket is Linux/macOS specific; on Windows, the CLI talks to dockerd over a named pipe).*",
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
        "• **Namespaces (pid, net, mnt, ipc, uts, user, cgroup):** Provide the illusion of a dedicated operating system by isolating process IDs (pid), network interfaces (net), mount points (mnt), file systems, user privileges (critical for rootless security), and cgroup boundaries.",
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
        "• **Cgroups (Control Groups):** Enforce strict resource limits, making sure a single container cannot hog all of your CPU, memory, or I/O.",
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
        "• **Capabilities and security modules (Seccomp, AppArmor, SELinux):** restrict what the container is allowed to touch, like kitchen safety rules.",
        "• **Union filesystem:** lets container images be built from layered, reusable pieces, like stacking pre-made sauces instead of remaking them from scratch every time.",
        "Containers are not tiny virtual machines. They are just regular Linux processes with strict boundaries drawn around them using these kernel features.",
      ],
    },
    {
      kind: "prose",
      body: [
        "**7. Docker Registry (The Warehouse That Stores Ingredients)**",
        "A container image has to come from somewhere. That's the job of the Docker Registry. When you run docker run nginx, Docker first checks whether the image already exists locally. If it doesn't, containerd pulls only the missing image layers from a registry such as Docker Hub or a private registry. Since layers are reusable and immutable, Docker downloads only what it needs, saving both storage and bandwidth."
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "The Docker Registry is the restaurant's warehouse. Before the chefs start cooking, they check the pantry. If an ingredient is missing, they order only what's needed instead of restocking the entire warehouse.",
    },
    {
      kind: "prose",
      body: [
        "**8. Docker Images & Layers (The Recipe Built from LEGO Blocks)**",
        "A Docker image isn't one giant file - it's a stack of read-only layers. Each instruction in a Dockerfile, like RUN or COPY, typically creates a new layer. Because these layers are cached and shared between images, Docker only rebuilds or downloads the parts that have changed, making builds and deployments much faster."
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "Think of an image like a LEGO model built from reusable bricks. If you change the roof, you don't rebuild the entire house - you simply replace the top layer while keeping the foundation intact.",
    },
    {
      kind: "prose",
      body: [
        "**9. Overlay2 (The Transparent Notebook)**",
        "Since image layers are read-only, Docker needs a place for containers to store changes. That's the job of Overlay2, Docker's default storage driver on Linux. It creates a thin writable layer on top of the image, and any file modifications happen there using a technique called Copy-on-Write (CoW). The original image always remains unchanged, allowing many containers to safely share the same base image."
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "Imagine every customer receives a transparent sheet placed over a printed menu. Any notes are written on the transparent sheet, while the original menu underneath stays untouched for everyone else.",
    },
    {
      kind: "prose",
      body: [
        "**10. VirtioFS (The Shared Conveyor Belt) (Docker Desktop for macOS)**",
        "Containers require a Linux kernel, so Docker Desktop runs them inside a lightweight Linux virtual machine. VirtioFS bridges the gap between macOS and that Linux VM by efficiently sharing files between them. This allows changes you make on your Mac to appear almost instantly inside your containers. *(Note: Windows uses WSL2's built-in file sharing equivalents).*",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "VirtioFS is like a conveyor belt between the restaurant's dining area and the kitchen, quickly passing ingredients and dishes back and forth without anyone having to walk between the two buildings.",
    },
    {
      kind: "prose",
      body: [
        "**11. Networking Service (VPNKit / Platform Networking) (Docker Desktop for macOS)**",
        "Since containers run inside a Linux virtual machine on macOS, they can't communicate directly with your Mac's network. Docker Desktop's networking service, such as VPNKit or the newer platform networking stack, bridges this gap by forwarding ports, handling internet access, and making localhost work seamlessly between your Mac and the containers. *(Note: Windows uses WSL2's own network proxying equivalents).*",
      ],
    },
    {
      kind: "callout",
      tone: "violet",
      title: "The Restaurant Analogy",
      body: "It's like a dedicated shuttle that carries customers and meals between the restaurant and a separate kitchen across town, making it feel like they're in the same building even though they're not.",
    },
    {
      kind: "prose",
      heading: "The End-to-End Flow: Running a Container",
      body: [
        "Let us trace exactly what happens when you hit Enter on `$ docker run nginx`:",
      ],
    },
    {
      kind: "docker-run-under-the-hood",
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "docker-architecture-dockerd-easy",
          question: "Which component is responsible for accepting API requests from the CLI but does NOT actually run containers itself?",
          options: [
            "containerd",
            "runc",
            "dockerd (Docker Daemon)",
            "Docker Registry"
          ],
          correctIndex: 2,
          explanation: "dockerd is the high-level orchestration layer that receives API requests from the CLI, but it delegates the actual container runtime execution to containerd."
        },
        {
          id: "docker-architecture-shim-medium-1",
          question: "Why does containerd create a dedicated 'shim' process for every container?",
          options: [
            "To make the container run faster",
            "To keep the container running if containerd crashes or restarts",
            "To translate Linux commands into macOS commands",
            "To download image layers from Docker Hub"
          ],
          correctIndex: 1,
          explanation: "The shim keeps the container's standard I/O streams open and reports its status, allowing the container to survive independently even if containerd is upgraded or restarted."
        },
        {
          id: "docker-architecture-runc-medium-2",
          question: "What happens to the 'runc' process immediately after the container starts running?",
          options: [
            "It continues running to monitor the container's CPU usage",
            "It waits for the container to finish before exiting",
            "It exits immediately, leaving the shim to supervise the container",
            "It transforms into the container process itself"
          ],
          correctIndex: 2,
          explanation: "runc has exactly one job: configuring the kernel boundaries and starting the process. The moment the process goes live, runc exits completely."
        },
        {
          id: "docker-architecture-oci-hard-1",
          question: "What is the primary purpose of the Open Container Initiative (OCI) standard in Docker's architecture?",
          options: [
            "To ensure that containers are completely secure and cannot be hacked",
            "To define a standard for container images and runtimes so tools can interoperate",
            "To replace Docker entirely with a new command line tool",
            "To provide a standard operating system for all containers to use"
          ],
          correctIndex: 1,
          explanation: "The OCI standard ensures that any OCI-compliant runtime (like runc) can run any OCI-compliant image. It's what allows Docker to play nicely with other container ecosystems."
        },
        {
          id: "docker-architecture-flow-hard-2",
          question: "Trace the flow of a 'docker run' command through the architecture. Which order is correct?",
          options: [
            "CLI -> containerd -> dockerd -> containerd-shim -> runc",
            "CLI -> dockerd -> containerd -> runc -> containerd-shim",
            "CLI -> dockerd -> containerd -> containerd-shim -> runc",
            "CLI -> dockerd -> runc -> containerd -> containerd-shim"
          ],
          correctIndex: 2,
          explanation: "The CLI talks to dockerd, which tells containerd to start a container. containerd spawns a shim, and the shim invokes runc to actually build and launch the container."
        }
      ]
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
        "If you're using **macOS** or **Windows**, the first thing you'll install isn't Docker Engine directly it's **Docker Desktop**.",
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
        "Containers aren't virtual machines they're isolated Linux processes that rely on Linux kernel features such as **namespaces** and **cgroups**.",
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
        "The infographic below shows the high-level startup sequence. Don't worry about understanding every component yet you'll learn how everything works internally in the **Docker Architecture** lesson.",
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
        "The **Docker CLI** is only a client it sends commands to the **Docker Engine**.",
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
      kind: "image",
      src: dockerDesktopHelloWorldImg,
      alt: "Running the Docker hello-world container for the first time",
      caption:
        "Your first Docker run: start Docker Desktop, run hello-world, and verify your installation.",
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
        "As with macOS, simply installing Docker Desktop isn't enough you must start the application and wait for the Docker Engine to finish starting before using Docker commands.",
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
        "Installing Docker is only half the job you also need to verify that everything is working correctly. The quickest way to do this is by checking the Docker client, confirming the Docker Engine is running, and finally launching your very first container.",
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
          id: "setup-verification-easy",
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
        {
          id: "setup-docker-desktop-medium-1",
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
          id: "setup-engine-running-medium-2",
          question: "Why must Docker Desktop be running before executing Docker commands in your terminal?",
          options: [
            "The Docker CLI starts Docker Engine automatically.",
            "The Docker CLI communicates with Docker Engine via an API, so the engine must already be running.",
            "Docker commands only work when the dashboard is open.",
            "Docker Desktop compiles Docker commands before running them.",
          ],
          correctIndex: 1,
          explanation:
            "The Docker CLI is simply a client. It sends requests to Docker Engine. If the engine isn't running, the CLI has nothing to communicate with and will return a 'cannot connect' error.",
        },
        {
          id: "setup-linux-hard-1",
          question: "How does Docker run on a native Linux host compared to macOS or Windows?",
          options: [
            "Linux still requires a lightweight VM to run Docker securely.",
            "Linux runs the Docker Daemon directly on the host OS without needing a hidden VM.",
            "Linux uses Docker Desktop exclusively to manage containers.",
            "Linux requires you to compile containers from source code every time."
          ],
          correctIndex: 1,
          explanation:
            "Because Linux already has the required kernel features (namespaces and cgroups), the Docker daemon runs natively as a system service. There is no need for a hidden VM."
        },
        {
          id: "setup-vm-under-hood-hard-2",
          question: "What technology does Docker Desktop use under the hood on modern Windows to provide the Linux kernel?",
          options: [
            "VirtualBox",
            "VMware Fusion",
            "Windows Subsystem for Linux (WSL 2)",
            "Cygwin"
          ],
          correctIndex: 2,
          explanation:
            "On modern Windows, Docker Desktop utilizes WSL 2 to run a lightweight, highly integrated Linux utility VM, which is much faster and more efficient than traditional hypervisors."
        }
      ],
    },
  ],
};


const terminalPrerequisites: LessonContent = {
  slug: "terminal-prerequisites",
  title: "Terminal Prerequisites",
  subtitle:
    "Before diving into Docker, let's cover the essential Linux terminal commands you'll use every day.",
  sections: [
    {
      kind: "prose",
      heading: "Why learn the terminal?",
      body: [
        "Docker is inherently a command-line tool. You will be typing commands, reading outputs, and navigating file systems. If you aren't comfortable with basic Linux commands, you'll be fighting the terminal instead of learning Docker.",
      ],
    },
    {
      kind: "table",
      caption: "Essential Terminal Commands",
      headers: ["Command", "Usage"],
      rows: [
        ["nano <file-name>", "Opens <file-name> in the nano text editor"],
        ["cat <file-name>", "Prints the contents of <file-name> to the console"],
        ["grep <pattern> <file>", "Searches for a specific word/pattern within a file"],
        ["tail -f <file>", "Watches a file in real-time as it grows (great for logs)"],
        ["less <file>", "Scrolls through large config files or logs safely"],
        ["touch <file-name>", "Creates an empty file"],
        ["echo \"<text>\"", "Prints <text> to the console"],
        ["<command> > <file>", "Overwrites <file> with the output of <command>"],
        ["<command> >> <file>", "Appends the output of <command> to the end of <file>"],
        ["ls -a", "Lists all files in the current directory, including hidden ones"],
        ["pwd", "Prints the working directory (your exact path)"],
        ["cd <dir>", "Changes the current directory to <dir>"],
        ["tree", "Visualizes the directory structure as a tree"],
        ["rm <file-name>", "Deletes a file"],
        ["rmdir <dir-name>", "Deletes an empty directory"],
        ["rm -rf <dir>", "Force deletes a directory and everything inside it"],
        ["chown <user> <file>", "Changes the owner of a file or directory"],
        ["chmod +x <file>", "Changes permissions to make a file executable"],
        ["curl <url>", "Tests network connectivity by fetching a web page"],
        ["ping <host>", "Tests basic network connectivity to another host"],
        ["top", "Displays live CPU and memory usage of running processes"],
        ["ps", "Lists currently running processes"],
        ["df -h", "Shows overall available disk space on the system"],
        ["du -sh <dir>", "Shows the total disk space used by a specific directory"],
        ["<command> -y", "Automatically responds 'yes' to prompts (crucial in Dockerfiles)"],
      ],
    },
    {
      kind: "prose",
      heading: "See them in action",
      body: [
        "Here is what these commands look like when used together in a real terminal session. Notice how we use `ls` or `cat` to verify that our previous commands actually worked:",
      ],
    },
    {
      kind: "terminal-animation",
      command: "mkdir my-app && cd my-app",
      output: `$ pwd
/home/user/my-app
# (we verified our exact location before proceeding)

$ echo "console.log('App started!');" > app.js

$ cat app.js
console.log('App started!');
# (read the file contents using cat)

$ echo "console.log('Doing some work...');" >> app.js

$ cat app.js
console.log('App started!');
console.log('Doing some work...');
# (appended new text using >> and verified it)

$ chmod +x app.js

$ ls -l
-rwxr-xr-x 1 user user 68 Jul 5 12:00 app.js
# (file was made executable via chmod)

$ mkdir logs
$ echo "Error: DB connection failed" > logs/app.log

$ tree
.
├── app.js
└── logs
    └── app.log
# (visualized our nested directory structure)

$ grep "Error" logs/app.log
Error: DB connection failed
# (filtered the logs to quickly find the crash)

$ ping -c 1 localhost
PING localhost (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.025 ms
# (verified basic networking is up)

$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
overlay          59G   20G   36G  36% /
# (checked our disk space usage to ensure we aren't full)

$ rm logs/app.log
$ rmdir logs
$ rm app.js
# (cleaned up our files and logs folder)

$ cd ..
$ rmdir my-app

$ ls my-app
ls: cannot access 'my-app': No such file or directory
# (rmdir successfully removed the now-empty directory)`,
      buttonLabel: "Run Session",
      caption: "Terminal session",
    },
    {
      kind: "prose",
      body: [
        "You'll use these commands frequently when writing Dockerfiles or debugging inside running containers. Memorize them!",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "prereq-ls-easy",
          question: "Which command lists the files in your current directory?",
          options: [
            "cd",
            "pwd",
            "ls",
            "cat"
          ],
          correctIndex: 2,
          explanation: "`ls` (list) shows the contents of the current directory."
        },
        {
          id: "prereq-append-medium-1",
          question: "What is the difference between `>` and `>>`?",
          options: [
            "`>` creates a file, `>>` deletes a file.",
            "`>` overwrites the file, `>>` appends to the end of the file.",
            "`>` is for text, `>>` is for binary files.",
            "There is no difference."
          ],
          correctIndex: 1,
          explanation: "`>` replaces the entire contents of the target file, whereas `>>` adds the new output to the very bottom."
        },
        {
          id: "prereq-nano-medium-2",
          question: "If you need to manually edit a configuration file inside a terminal, which tool would you use?",
          options: [
            "echo",
            "cat",
            "nano",
            "touch"
          ],
          correctIndex: 2,
          explanation: "`nano` is a simple, beginner-friendly command-line text editor."
        },
        {
          id: "prereq-y-flag-hard-1",
          question: "Why is the `-y` flag (e.g. `apt-get install -y curl`) extremely important when writing Dockerfiles?",
          options: [
            "It makes the installation run faster.",
            "It automatically answers 'yes' to prompts, preventing the automated build process from freezing.",
            "It verifies the installation was successful.",
            "It uses the 'Yarn' package manager instead of 'apt'."
          ],
          correctIndex: 1,
          explanation: "Docker image builds are non-interactive. If a command stops to ask 'Do you want to continue? [Y/n]', the build will hang forever. `-y` skips the prompt."
        },
        {
          id: "prereq-combo-hard-2",
          question: "If you run `touch newfile.txt` followed by `cat newfile.txt`, what will the output be?",
          options: [
            "An error message.",
            "Nothing (blank output).",
            "'newfile.txt'",
            "A prompt asking you to edit the file."
          ],
          correctIndex: 1,
          explanation: "`touch` creates an empty file. `cat` reads a file and prints its contents. Reading an empty file prints absolutely nothing."
        }
      ]
    }
  ]
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
      kind: "prose",
      body: [
        "The `-it` flags are a pair: `-i` keeps STDIN open so you can type, and `-t` allocates a pseudo-terminal so you get a proper prompt. Now you are inside a minimal Ubuntu environment.",
      ],
    },
    {
      kind: "terminal-animation",
      command: "docker run -it ubuntu bash",
      output: `Unable to find image 'ubuntu:latest' locally
latest: Pulling from library/ubuntu
8c208920155b: Pull complete 
Digest: sha256:d89408b0672e811c00222a7f5a6bfa9f1ed73e970a6c62cdaef3ce010f6991ee
Status: Downloaded newer image for ubuntu:latest

root@a1b2c3d4e5f6:/# cat /etc/os-release
PRETTY_NAME="Ubuntu 24.04 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"

root@a1b2c3d4e5f6:/# ls /
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

root@a1b2c3d4e5f6:/# apt-get update && apt-get install -y curl
Get:1 http://archive.ubuntu.com/ubuntu noble InRelease [256 kB]
Get:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]
Fetched 382 kB in 1s (439 kB/s)
Reading package lists... Done

root@a1b2c3d4e5f6:/# exit`,
      caption: "Interactive mode",
      buttonLabel: "Launch Ubuntu",
    },
    {
      kind: "prose",
      heading: "Running an actual web server",
      body: ["Something more practical. Run Nginx:"],
    },
    {
      kind: "terminal-animation",
      command: "docker run -d -p 8080:80 --name my-nginx nginx",
      output: `Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
afc163c2a36d: Pull complete
digest: sha256:98f0e8b5b6c06a8f3b7f6a7d2e8d4d8b0c8c0f2c7c8d0a7f6a5b4e3c2d1f0a9b
Status: Downloaded newer image for nginx:latest
8b3c2c5d8e1a4f9e2b7c8d6a1e5f3b9c7a2d1e0f6b5c4a3d2e1f0a9b8c7d6e5f4`,
      caption: "docker run, for real this time",
      buttonLabel: "Run Nginx",
    },
    {
      kind: "prose",
      body: [
        "Breaking this down: **`-d`** runs it in the background, in detached mode. **`-p 8080:80`** maps port 8080 on your machine to port 80 inside the container. **`--name my-nginx`** gives it a human-readable name you can reference later. **`nginx`** is simply the image to use.",
        "Now visit `http://localhost:8080` in your browser. That page is being served by Nginx, running inside a Docker container.",
      ],
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
        "`-it` gets you an interactive shell inside the container.",
        "`-d` runs it detached, in the background.",
        "`-p host:container` maps a port on your machine to a port inside the container.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "first-container-run-easy",
          question: "What does the `docker run` command actually do?",
          options: [
            "Only downloads an image from Docker Hub",
            "Pulls an image (if needed), creates a new container, and starts it",
            "Starts a previously stopped container",
            "Compiles source code into a new image"
          ],
          correctIndex: 1,
          explanation: "`docker run` is an all-in-one command. It handles the pull, the create, and the start phases automatically."
        },
        {
          id: "first-container-it-medium-1",
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
          id: "first-container-port-medium-2",
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
        {
          id: "first-container-d-hard-1",
          question: "What happens to the terminal window if you omit the `-d` flag when running a web server container?",
          options: [
            "The container fails to start due to lack of a daemon.",
            "The container starts, but you won't see any logs.",
            "The container runs in the foreground, hijacking your terminal and blocking further commands until stopped.",
            "The web server automatically shuts down."
          ],
          correctIndex: 2,
          explanation: "Without `-d` (detached mode), Docker attaches your terminal's STDOUT to the container's STDOUT. The container monopolizes your prompt."
        },
        {
          id: "first-container-pull-hard-2",
          question: "If you run `docker run ubuntu` and Docker says 'Unable to find image locally', what happens next?",
          options: [
            "The command fails and exits immediately.",
            "Docker automatically reaches out to Docker Hub, downloads the image, and then runs it.",
            "Docker prompts you for a URL to download the image from.",
            "Docker builds a new Ubuntu image from scratch using your local OS."
          ],
          correctIndex: 1,
          explanation: "Docker's default behavior is to transparently pull missing images from the configured registry (usually Docker Hub) before running."
        }
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
      settingUpDocker,
      dockerArchitecture,
      terminalPrerequisites,
      yourFirstContainer,
    ],
  },
};
