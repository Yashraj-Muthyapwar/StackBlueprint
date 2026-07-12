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
import understandPortsImg from "@/images/docker/foundations/understand_ports.png";

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
        "For example, if you want to start a web server on a completely different machine across your network, you can just point your local CLI to that remote host using the **`-H` flag**.",
      ],
    },
    {
      kind: "code",
      language: "bash",
      code: "# Point the CLI to a remote daemon on port 2375 and start Nginx\ndocker -H=10.123.2.1:2375 run nginx",
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
        "You can tap into these control groups directly from your terminal by passing specific flags to cap how much juice a container is allowed to sip.",
        "For example, you can easily restrict a process to half a CPU core and a strict 100 megabyte memory limit:",
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "# Cap this container to 50% of a single CPU core\ndocker run --cpus=0.5 ubuntu\n\n# Restrict this container to a maximum of 100 megabytes of memory\ndocker run --memory=100m ubuntu",
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
      kind: "callout",
      tone: "success",
      title: "The power of decoupled architecture",
      body: "Docker's split architecture isn't just an implementation detail. It's what allows containers to be incredibly stable, fast, and interoperable with the wider container ecosystem.",
    },
    {
      kind: "takeaways",
      items: [
        "`dockerd` is the high-level manager you talk to; it doesn't run containers itself.",
        "`containerd` manages the lifecycle of the container and handles images.",
        "`containerd-shim` keeps the container alive even if the main Docker daemon crashes or updates.",
        "`runc` is the low-level worker that actually creates the container, then immediately exits.",
      ],
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
        ["tree", "Visualizes the directory structure as a tree (may require 'apt install tree' on minimal images)"],
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
/dev/sda1        59G   20G   36G  36% /
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
      kind: "prose",
      heading: "Understanding Ports",
      body: [
        "Since we are going to be connecting to containers and running web servers, you need to understand **ports**. If an IP address (like `127.0.0.1` or `localhost`) is the street address of an apartment building, a port is the specific apartment number.",
        "There are 65,535 possible ports on any given computer. The first **1,024** ports are considered \"privileged\" and usually require admin rights. Beyond that, many ports are officially registered to specific applications by the **IANA** (Internet Assigned Numbers Authority). For example, a **web server** usually \"listens\" on **port** `80` **(HTTP)** or `443` **(HTTPS)**, **PostgreSQL** uses `5432`, and **MySQL** uses `3306`.",
        "When we run Docker containers later, we will frequently **map** a port from our host machine to a port inside the container. This acts like a mailroom forwarding traffic from the building's main entrance to the specific container's apartment."
      ],
    },
    {
      kind: "image",
      src: understandPortsImg,
      alt: "Understanding Ports Analogy",
    },
    {
      kind: "callout",
      tone: "success",
      title: "The terminal is your primary tool",
      body: "Docker is designed to be automated and scripted. Graphical interfaces are great for monitoring, but the terminal is where you'll build, run, and debug containers.",
    },
    {
      kind: "takeaways",
      items: [
        "Use `ls`, `cd`, and `pwd` to navigate the file system and confirm where you are.",
        "Use `cat`, `grep`, and `tail` to read, search, and monitor files (especially logs).",
        "Use `rm`, `rmdir`, and `mkdir` to manage files and folders.",
        "Ports are like apartment numbers that determine which specific application receives network traffic."
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "prereq-cmd-pwd",
          question: "Print the working directory (your exact path).",
          commandAnswer: "pwd",
          explanation: "`pwd` stands for 'print working directory'. It tells you exactly where you are in the filesystem."
        },
        {
          id: "prereq-cmd-ls",
          question: "List all files in the current directory, including hidden ones.",
          commandAnswer: ["ls -a", "ls -al", "ls -la"],
          explanation: "`ls` lists files, and the `-a` (all) flag ensures hidden files (those starting with a dot) are included."
        },
        {
          id: "prereq-cmd-touch",
          question: "Create an empty file named `config.yml`.",
          commandAnswer: "touch config.yml",
          explanation: "`touch` is the quickest way to create a new, empty file."
        },
        {
          id: "prereq-cmd-cat",
          question: "Print the entire contents of `app.log` to the console.",
          commandAnswer: "cat app.log",
          explanation: "`cat` (concatenate) reads a file and dumps its entire content to the standard output."
        },
        {
          id: "prereq-cmd-grep",
          question: "Search for the word 'Error' inside `app.log`.",
          commandAnswer: ["grep Error app.log", "grep 'Error' app.log", 'grep "Error" app.log'],
          explanation: "`grep` is an essential tool for searching plain-text data sets for lines that match a regular expression."
        },
        {
          id: "prereq-cmd-rm",
          question: "Force delete a directory named `old-logs` and everything inside it without prompting.",
          commandAnswer: ["rm -rf old-logs", "rm -r -f old-logs", "rm -f -r old-logs"],
          explanation: "`rm` removes files. `-r` (recursive) removes directories and their contents. `-f` (force) ignores nonexistent files and never prompts."
        },
        {
          id: "prereq-cmd-tail",
          question: "Watch the file `server.log` in real-time as it grows.",
          commandAnswer: ["tail -f server.log"],
          explanation: "`tail -f` outputs the last part of files and keeps reading as the file grows, which is perfect for live server logs."
        },
        {
          id: "prereq-cmd-chmod",
          question: "Make the script `run.sh` executable.",
          commandAnswer: ["chmod +x run.sh", "chmod a+x run.sh"],
          explanation: "`chmod` changes file modes or Access Control Lists. `+x` adds the execute permission."
        },
        {
          id: "prereq-cmd-apt",
          question: "Install `curl` using `apt-get install` without it hanging on a confirmation prompt.",
          commandAnswer: ["apt-get install -y curl", "apt-get install curl -y"],
          explanation: "The `-y` flag answers 'yes' automatically. Without it, automated scripts (like Docker image builds) will hang forever waiting for user input."
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
ade0b5cbf7f1: Pull complete 
b2b4144bf869: Pull complete 
8cf892a939dd: Download complete 
Digest: sha256:b7f48194d4d8b763a478a621cdc81c27be222ba2206ca3ca6bc42b49685f3d9e
Status: Downloaded newer image for ubuntu:latest

root@2be2b4cc1d2c:/# cat /etc/os-release
PRETTY_NAME="Ubuntu 26.04 LTS"
NAME="Ubuntu"
VERSION_ID="26.04"
VERSION="26.04 LTS (Resolute Raccoon)"
VERSION_CODENAME=resolute
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=resolute
LOGO=ubuntu-logo

root@2be2b4cc1d2c:/# ls /
bin   dev  home  media  opt   root  sbin  sys  usr
boot  etc  lib   mnt    proc  run   srv   tmp  var

root@2be2b4cc1d2c:/# exit
exit
`,
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
81b43e7a1eae: Pull complete 
5d1f91636239: Pull complete 
63e237f10cf6: Pull complete 
74e33773ee42: Pull complete 
3be819c1c8cf: Pull complete 
41103e2ff54e: Pull complete 
75e5e08234c9: Pull complete 
8c0925824bff: Download complete 
dd2ea61022d9: Download complete 
Digest: sha256:ec4ed8b5299e5e90694af7750eb6dffd2627317d30544d056b0371f8082f7bce
Status: Downloaded newer image for nginx:latest
b904c9ea8942622d6fb3980c28db4e86db07465ca7aafc6b3bcbbdb3306df4d7`,
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
          id: "first-container-cmd-0",
          question: "Run the official `hello-world` image to verify Docker is working.",
          commandAnswer: "docker run hello-world",
          explanation: "This simple command pulls the `hello-world` image (if not already local) and runs it in the foreground to print a confirmation message."
        },
        {
          id: "first-container-cmd-1",
          question: "Run an Ubuntu container interactively with a pseudo-terminal.",
          commandAnswer: ["docker run -it ubuntu", "docker run -ti ubuntu", "docker run -i -t ubuntu", "docker run -t -i ubuntu"],
          explanation: "The `-i` flag keeps STDIN open, and `-t` allocates a pseudo-terminal. Together `-it` gives you an interactive shell inside the container."
        },
        {
          id: "first-container-cmd-2",
          question: "Run an Nginx container in the background (detached mode).",
          commandAnswer: ["docker run -d nginx", "docker run --detach nginx"],
          explanation: "The `-d` flag runs the container in detached mode, meaning it runs in the background and frees up your terminal."
        },
        {
          id: "first-container-cmd-3",
          question: "Run an Nginx container in the background, mapping port 8080 on your host to port 80 inside the container.",
          commandAnswer: [
            "docker run -d -p 8080:80 nginx",
            "docker run -p 8080:80 -d nginx",
            "docker run -dp 8080:80 nginx",
            "docker run -pd 8080:80 nginx"
          ],
          explanation: "The `-p` flag maps ports in the format `host:container`. `-d` keeps it in the background."
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

const basicDockerCommands: LessonContent = {
  slug: "basic-docker-commands",
  title: "Basic Docker Commands",
  subtitle: "Before you run a single container, it helps to know what Docker is actually doing behind the scenes.",
  sections: [
    {
      kind: "prose",
      heading: "Checking your Docker setup",
      body: [
        "Two commands are worth knowing before you run anything at all. `docker version` tells you which version of the Docker client and server (the daemon) you have installed, and confirms they can actually talk to each other:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker version",
      output: `Client:
 Version:           27.3.1
 API version:       1.47
 Go version:        go1.22.7

Server:
 Engine:
  Version:          27.3.1
  API version:      1.47 (minimum version 1.24)`,
      buttonLabel: "Run Command",
      caption: "Check Docker version",
    },
    {
      kind: "prose",
      body: [
        "`docker info` goes further and gives you a snapshot of the whole Docker environment: how many containers and images you have, how much CPU and memory Docker can see, which storage driver it's using, and more:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker info",
      output: `Containers: 4
 Running: 1
 Paused: 0
 Stopped: 3
Images: 6
Server Version: 27.3.1
Storage Driver: overlay2
CPUs: 8
Total Memory: 15.6GiB`,
      buttonLabel: "Run Command",
      caption: "Check Docker info",
    },
    {
      kind: "prose",
      body: [
        "If something feels off later on (a container behaving strangely, an image acting different than expected), these two commands are a reasonable first stop, just to confirm you're running the version you think you're running.",
      ]
    },
    {
      kind: "prose",
      heading: "Running a container",
      body: [
        "`docker run` is the command that starts a container from an image:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run httpd",
      output: `Unable to find image 'httpd:latest' locally
latest: Pulling from library/httpd
a2abf6c4d29d: Pull complete
c7b6944d7cb3: Pull complete
Status: Downloaded newer image for httpd:latest`,
      buttonLabel: "Run Command",
      caption: "Start a container",
    },
    {
      kind: "prose",
      body: [
        "If the `httpd` (Apache) image isn't already sitting on your machine, Docker fetches it from Docker Hub first, then starts the container.",
        "Run that same command again, and there is no download step this time. Docker already has the image, so it just starts the container immediately.",
      ]
    },
    {
      kind: "prose",
      heading: "Listing containers",
      body: [
        "`docker ps` shows you every container that is currently running:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker ps",
      output: `CONTAINER ID   IMAGE   COMMAND              CREATED         STATUS         PORTS     NAMES
7f2a19b3c9e1   httpd   "httpd-foreground"   5 seconds ago   Up 4 seconds   80/tcp    eager_lovelace`,
      buttonLabel: "Run Command",
      caption: "List running containers",
    },
    {
      kind: "prose",
      body: [
        "Stopped and exited containers do not show up here by default. Add `-a` to see the full picture, running and not:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker ps -a",
      output: `CONTAINER ID   IMAGE     COMMAND               CREATED          STATUS                       NAMES
7f2a19b3c9e1   httpd     "httpd-foreground"    5 seconds ago    Up 4 seconds                 eager_lovelace
b118cc02a94f   alpine    "/bin/sh"             2 minutes ago    Exited (0) 2 minutes ago     quirky_borg`,
      buttonLabel: "Run Command",
      caption: "List all containers",
    },
    {
      kind: "prose",
      body: [
        "That `-a` flag is one you'll reach for constantly, mainly to answer the question \"where did that container actually go?\"",
      ]
    },
    {
      kind: "prose",
      heading: "Stopping and removing containers",
      body: [
        "Stopping a container needs its ID or name, both of which you can grab from `docker ps`:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker stop eager_lovelace",
      output: `eager_lovelace`,
      buttonLabel: "Run Command",
      caption: "Stop a container",
    },
    {
      kind: "prose",
      body: [
        "Once stopped, the container still exists, just not running. To get rid of it for good:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker rm eager_lovelace",
      output: `eager_lovelace
$ docker ps -a
CONTAINER ID   IMAGE     COMMAND               CREATED          STATUS                       NAMES
b118cc02a94f   alpine    "/bin/sh"             3 minutes ago    Exited (0) 3 minutes ago     quirky_borg`,
      buttonLabel: "Run Session",
      caption: "Remove a container",
    },
    {
      kind: "prose",
      body: [
        "The container will no longer show up anywhere, including in `docker ps -a`.",
      ]
    },
    {
      kind: "prose",
      heading: "Managing images",
      body: [
        "Every image you've pulled or run lives locally until you remove it. See the full list with:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker images",
      output: `REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
httpd        latest    3b4b6a4dfb00   3 days ago      166MB
alpine       latest    3fd9065eaf02   18 months ago   4.14MB
postgres     latest    d3a0a4c0e5c4   6 months ago    412MB`,
      buttonLabel: "Run Command",
      caption: "List images",
    },
    {
      kind: "prose",
      body: [
        "If you want to grab an image ahead of time, without starting a container from it right away, `docker pull` does exactly that:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker pull alpine",
      output: `Using default tag: latest
latest: Pulling from library/alpine
c158987b0551: Pull complete
Status: Downloaded newer image for alpine:latest`,
      buttonLabel: "Run Command",
      caption: "Pull an image",
    },
    {
      kind: "prose",
      body: [
        "And when an image is no longer needed, remove it with `docker rmi`, as long as no container (even a stopped one) still depends on it:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker rmi alpine",
      output: `Untagged: alpine:latest
Deleted: sha256:3fd9065eaf02feaf94d68376da52541925a1b73da7ce3b4a0e5763fa5ffdb2f`,
      buttonLabel: "Run Command",
      caption: "Remove an image",
    },
    {
      kind: "prose",
      body: [
        "If Docker refuses because a container is still referencing that image, remove the container first, then try again.",
      ]
    },
    {
      kind: "prose",
      heading: "Inspecting a container in detail",
      body: [
        "`docker ps` gives you a quick overview. When you need the full picture, every configuration detail Docker knows about a container, use `docker inspect`:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker inspect eager_lovelace",
      output: `[
    {
        "Id": "7f2a19b3c9e1...",
        "State": {
            "Status": "running",
            "Running": true
        },
        "Config": {
            "Image": "httpd",
            "Entrypoint": ["httpd-foreground"]
        },
        "NetworkSettings": {
            "IPAddress": "172.17.0.2"
        }
    }
]`,
      buttonLabel: "Run Command",
      caption: "Inspect a container",
    },
    {
      kind: "prose",
      body: [
        "This is where you'd look to confirm a container's internal IP address, check what command it actually started with, or see every environment variable it's running with.",
      ]
    },
    {
      kind: "prose",
      heading: "Viewing logs",
      body: [
        "If a container is running in the background (more on that in the next lesson), you can't see its output just by looking at your terminal. `docker logs` shows you what it has printed since it started:",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker logs eager_lovelace",
      output: `[Thu Jul 04 10:02:11.2026] AH00558: httpd: Could not reliably determine the server's fully qualified domain name
[Thu Jul 04 10:02:11.2026] [mpm_event:notice] AH00489: Apache/2.4 configured, resuming normal operations`,
      buttonLabel: "Run Command",
      caption: "View logs",
    },
    {
      kind: "prose",
      body: [
        "Worth knowing: those timestamps aren't when you happened to run the command, they're whatever the container's own internal clock recorded the moment each line was written. If a container's clock is off (wrong timezone, wrong date entirely), its logs will confidently report the wrong time right along with it. That's a real thing to check before you spend twenty minutes wondering why a log entry looks like it's from the future or the past.",
        "By default, `docker logs` prints what's already been written and then exits, it does not sit there waiting for new lines. If you want to watch a container's output as it happens, the way you'd `tail -f` a log file, add `-f` (follow):",
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker logs -f eager_lovelace",
      output: `[Thu Jul 04 10:02:11.2026] AH00558: httpd: Could not reliably determine the server's fully qualified domain name
[Thu Jul 04 10:02:11.2026] [mpm_event:notice] AH00489: Apache/2.4 configured, resuming normal operations
172.17.0.1 - - [04/Jul/2026:10:02:45 +0000] "GET / HTTP/1.1" 200 45`,
      buttonLabel: "Run Command",
      caption: "Follow logs",
    },
    {
      kind: "prose",
      body: [
        "New lines print as the container produces them, in real time, until you press `Ctrl+C` to stop watching. That doesn't stop the container itself, it just ends your view into it, the same idea as detaching without touching the process underneath.",
        "This is usually the very first thing to check whenever a container isn't behaving the way you expect, before touching anything else.",
      ]
    },
    {
      kind: "takeaways",
      items: [
        "`docker version` and `docker info` tell you what Docker is actually running, and how much it can see of your system.",
        "`docker run <image>` starts a container, pulling the image automatically the first time.",
        "`docker ps` shows running containers only; `docker ps -a` shows every container, including stopped ones.",
        "`docker stop` halts a container without deleting it; `docker rm` removes it for good.",
        "`docker images`, `docker pull`, and `docker rmi` list, download, and remove images locally.",
        "`docker inspect` returns full configuration detail for a container as JSON.",
        "`docker logs` shows what it has printed, and `docker logs -f` follows new output live instead of just dumping what's already there.",
        "Log timestamps come from the container's own internal clock, not your host's, so a container with the wrong system time will produce logs with the wrong time too."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "basic-cmd-version",
          question: "Check the installed Docker client and server versions to ensure they can talk to each other.",
          commandAnswer: ["docker version", "docker --version", "docker -v"],
          explanation: "`docker version` checks both client and server, while `docker --version` just checks the client."
        },
        {
          id: "basic-cmd-info",
          question: "View a high-level summary of your Docker environment (total containers, CPU, memory).",
          commandAnswer: "docker info",
          explanation: "`docker info` is great for a quick health and capacity check of your Docker daemon."
        },
        {
          id: "basic-cmd-ps",
          question: "List only the containers that are currently running.",
          commandAnswer: "docker ps",
          explanation: "`docker ps` (process status) shows live containers."
        },
        {
          id: "basic-cmd-ps-a",
          question: "List all containers, including stopped and exited ones.",
          commandAnswer: ["docker ps -a", "docker ps --all"],
          explanation: "The `-a` flag gives you the full picture."
        },
        {
          id: "basic-cmd-stop",
          question: "Stop a running container named `my-web-app`.",
          commandAnswer: "docker stop my-web-app",
          explanation: "`docker stop` sends a SIGTERM signal to gracefully halt the container."
        },
        {
          id: "basic-cmd-rm",
          question: "Remove a stopped container named `my-web-app`.",
          commandAnswer: "docker rm my-web-app",
          explanation: "`docker rm` deletes the container from your system permanently."
        },
        {
          id: "basic-cmd-images",
          question: "List all Docker images stored locally on your machine.",
          commandAnswer: ["docker images", "docker image ls"],
          explanation: "`docker images` gives you a quick overview of what's taking up disk space."
        },
        {
          id: "basic-cmd-pull",
          question: "Download the `nginx` image from Docker Hub without starting a container.",
          commandAnswer: "docker pull nginx",
          explanation: "`docker pull` fetches the image so it's ready for later use."
        },
        {
          id: "basic-cmd-rmi",
          question: "Delete the local `nginx` image.",
          commandAnswer: ["docker rmi nginx", "docker image rm nginx"],
          explanation: "`docker rmi` removes the image (as long as no containers are using it)."
        },
        {
          id: "basic-cmd-inspect",
          question: "View the full JSON configuration for a container named `my-web-app`.",
          commandAnswer: "docker inspect my-web-app",
          explanation: "`docker inspect` dumps every detail, from networking to mounted volumes."
        },
        {
          id: "basic-cmd-logs",
          question: "View the existing output/logs for a container named `my-web-app`.",
          commandAnswer: "docker logs my-web-app",
          explanation: "`docker logs` shows you what the process printed since it started."
        },
        {
          id: "basic-cmd-logs-f",
          question: "Follow the logs for a container named `my-web-app` live in real time.",
          commandAnswer: ["docker logs -f my-web-app", "docker logs --follow my-web-app"],
          explanation: "The `-f` flag turns `docker logs` into a live tailing session."
        }
      ]
    }
  ]
};


const dockerRunCommands: LessonContent = {
  slug: "docker-run-commands",
  title: "Docker Run Commands",
  subtitle: "`docker run` looks like one simple command, but the flags around it change almost everything about how a container behaves.",
  sections: [
    {
      kind: "prose",
      heading: "Choosing a version with tags",
      body: [
        "Left on its own, `docker run` grabs whichever image is tagged `latest`:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run postgres",
      output: `Using default tag: latest
latest: Pulling from library/postgres
Status: Downloaded newer image for postgres:latest`,
      buttonLabel: "Run Command",
      caption: "Run with default latest tag",
    },
    {
      kind: "prose",
      body: [
        "If you need a specific version instead, add a colon and the tag:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run postgres:13",
      output: `Unable to find image 'postgres:13' locally
13: Pulling from library/postgres
Status: Downloaded newer image for postgres:13`,
      buttonLabel: "Run Command",
      caption: "Run with a specific tag",
    },
    {
      kind: "prose",
      body: [
        "Two completely different versions of Postgres, both available on your machine at the same time, each addressed by its own tag. Check an image's Docker Hub page for the full list of tags it publishes before assuming \"latest\" is what you actually want, especially for anything going into production."
      ]
    },
    {
      kind: "prose",
      heading: "Interactive input: `-i` alone isn't enough",
      body: [
        "Some programs expect you to type something back. Picture a small script that asks for your name before greeting you:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: `Please tell me your name: Riya\nHello, Riya!`,
    },
    {
      kind: "prose",
      body: [
        "Run that same program in a container with no flags, and it never gets the chance to ask:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run StackBlueprint/name-prompt",
      output: `Hello, !`,
      buttonLabel: "Run Command",
      caption: "Non-interactive run",
    },
    {
      kind: "prose",
      body: [
        "Containers run non-interactively by default, so there's nothing there to receive typed input. Adding just `-i` (keep stdin open) still isn't enough on its own:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -i StackBlueprint/name-prompt",
      output: `$ Riya
Hello, Riya!`,
      buttonLabel: "Run Command",
      caption: "Running with just -i",
    },
    {
      kind: "prose",
      body: [
        "Notice the prompt text itself never appears, only your typed answer and the final greeting. That's because `-i` keeps input open, but there's no terminal for the prompt to be displayed on. Add `-t` (allocate a pseudo-terminal) alongside it, and the container behaves exactly like running the program directly on your machine:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -it StackBlueprint/name-prompt",
      output: `Please tell me your name: Riya
Hello, Riya!`,
      buttonLabel: "Run Command",
      caption: "Running with -it",
    },
    {
      kind: "prose",
      body: [
        "`-it` together, not just `-i`, is the combination to reach for anytime a container needs to prompt for input or give you an interactive shell."
      ]
    },
    {
      kind: "prose",
      heading: "Publishing ports so others can reach your app",
      body: [
        "A container's own IP address (something like `172.17.0.2`) only exists inside Docker's internal network, it isn't reachable from your browser or from anywhere outside the host. Say a small web app inside a container is listening on port 5000:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run StackBlueprint/simple-webapp",
      output: `* Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)`,
      buttonLabel: "Run Command",
      caption: "Running a web app",
    },
    {
      kind: "prose",
      body: [
        "To reach it from outside the container, map a port on your host to that container port with `-p`:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -p 80:5000 StackBlueprint/simple-webapp",
      output: `* Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)`,
      buttonLabel: "Run Command",
      caption: "Publishing a port",
    },
    {
      kind: "prose",
      body: [
        "Now anyone hitting `http://<your-host-ip>:80` gets routed straight to port 5000 inside the container. Nothing stops you from running several instances of the same app side by side, each on its own host port:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -p 80:5000 StackBlueprint/simple-webapp",
      output: `* Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
$ docker run -p 8000:5000 StackBlueprint/simple-webapp
* Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
$ docker run -p 8001:5000 StackBlueprint/simple-webapp
* Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)`,
      buttonLabel: "Run Session",
      caption: "Running multiple instances",
    },
    {
      kind: "prose",
      body: [
        "Three separate containers, three separate host ports, all pointing at copies of the same image."
      ]
    },
    {
      kind: "prose",
      heading: "A word on volumes",
      body: [
        "A container's filesystem disappears the moment the container is removed. That's fine for a stateless web server, but a real problem for something like a database:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -d --name notesdb postgres",
      output: `d3a0a4c0e5c4
$ docker stop notesdb
notesdb
$ docker rm notesdb
notesdb`,
      buttonLabel: "Run Session",
      caption: "Data disappears with the container",
    },
    {
      kind: "prose",
      body: [
        "Every row that database ever wrote is gone along with the container. Mounting a folder from your host into the container with `-v` keeps the data outside the container's own lifecycle:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -v /opt/pgdata:/var/lib/postgresql/data postgres",
      output: `PostgreSQL Database Directory appears to contain a database; Skipping initialization...`,
      buttonLabel: "Run Command",
      caption: "Mounting a volume",
    },
    {
      kind: "prose",
      body: [
        "That's the short version. Volumes have enough nuance (bind mounts vs named volumes, permissions, sharing across containers) that they get a full lesson of their own in the Storage chapter. For now, just know the flag exists and roughly what problem it solves."
      ]
    },
    {
      kind: "prose",
      heading: "Inspecting a running container for its address",
      body: [
        "Once a container is up, `docker inspect` is how you find details that don't show up in `docker ps`, like its internal IP address:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker inspect notesdb",
      output: `[
    {
        "Id": "7f2a19b3c9e1...",
        "State": {
            "Status": "running",
            "Running": true
        },
        "Config": {
            "Image": "postgres",
            "Entrypoint": ["docker-entrypoint.sh"]
        },
        "NetworkSettings": {
            "IPAddress": "172.17.0.3"
        }
    }
]`,
      buttonLabel: "Run Command",
      caption: "Inspecting for IP address",
    },
    {
      kind: "prose",
      body: [
        "That address is only reachable from inside the Docker host itself, which is exactly why port mapping with `-p` matters for anything you need to reach from outside."
      ]
    },
    {
      kind: "prose",
      heading: "Checking on a container running in the background",
      body: [
        "Combine everything above and you get the shape most real containers actually run in: detached, port mapped, and named so you can find it again:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker run -d -p 3000:3000 --name notes-api StackBlueprint/notes-api",
      output: `a1e6d9f27b3c4e5a1908f7c6b3a2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c`,
      buttonLabel: "Run Command",
      caption: "Running a detached container",
    },
    {
      kind: "prose",
      body: [
        "Check that it's actually up, and watch what it has printed so far:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker ps",
      output: `CONTAINER ID   IMAGE                 COMMAND         CREATED         STATUS         PORTS      NAMES
a1e6d9f27b3c   StackBlueprint/notes-api   "node app.js"   2 seconds ago   Up 2 seconds   3000/tcp   notes-api
$ docker logs notes-api
Notes API listening on port 3000
Connected to database`,
      buttonLabel: "Run Session",
      caption: "Checking status and logs",
    },
    {
      kind: "prose",
      body: [
        "That's a one-time dump though, it prints what's already there and exits. To watch new lines as they arrive, add `-f`:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker logs -f notes-api",
      output: `Notes API listening on port 3000
Connected to database
Request received: GET /notes
Request received: POST /notes`,
      buttonLabel: "Run Command",
      caption: "Following logs",
    },
    {
      kind: "prose",
      body: [
        "New output streams in live from here on, until you press `Ctrl+C` to stop watching. The container keeps running either way, you're only ending your own view into it.",
        "If you ever need to reattach directly to a detached container's console instead of just reading its logs, `docker attach` does that, using either the full container ID or a short unique prefix:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker attach a1e6d",
      output: `Notes API listening on port 3000
Connected to database`,
      buttonLabel: "Run Command",
      caption: "Attaching to a container",
    },
    {
      kind: "prose",
      heading: "Detaching without stopping the container",
      body: [
        "Once you're attached, leaving carelessly can cost you. Pressing `Ctrl+C` doesn't just disconnect your terminal, it sends an interrupt signal straight to the container's main process, which will often stop it entirely. If that process is your web server, you've just taken it down by trying to walk away from it.",
        "The safe way to detach is a different key combination: `Ctrl+P` followed by `Ctrl+Q`. This disconnects your terminal from the container without touching the process running inside it:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker attach notes-api",
      output: `Notes API listening on port 3000
$ Ctrl+P Ctrl+Q
read escape sequence`,
      buttonLabel: "Run Session",
      caption: "Detaching safely",
    },
    {
      kind: "prose",
      body: [
        "Press `Ctrl+P`, then `Ctrl+Q`, and you're back at your own shell. Check that the container is still running exactly as it was:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker ps",
      output: `CONTAINER ID   IMAGE                 COMMAND         CREATED         STATUS         PORTS      NAMES
a1e6d9f27b3c   StackBlueprint/notes-api   "node app.js"   2 minutes ago   Up 2 minutes   3000/tcp   notes-api`,
      buttonLabel: "Run Command",
      caption: "Verifying container is still up",
    },
    {
      kind: "prose",
      body: [
        "Still up, still serving requests, exactly as if you'd never attached at all. You can reattach with `docker attach notes-api` any time you need to check on it again, using `Ctrl+P Ctrl+Q` to step away safely each time."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "Append `:<tag>` to an image name to run a specific version instead of `latest`.",
        "`-i` alone keeps input open, but only `-it` together gives a container a real interactive terminal.",
        "`-p <host-port>:<container-port>` is what makes a container reachable from outside the Docker host, and you can map several host ports to run multiple instances at once.",
        "Container filesystems are temporary; `-v` mounts a host folder into the container so data survives even after the container is removed (covered fully in the Storage chapter).",
        "`docker inspect` reveals a container's internal IP and configuration; `docker logs` shows its output; `docker attach` reconnects your terminal directly to it.",
        "To leave an attached container safely, use `Ctrl+P` then `Ctrl+Q`, not `Ctrl+C`. `Ctrl+C` sends an interrupt straight to the container's process and can stop it."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "run-cmd-tag",
          question: "Run the `postgres` image with a specific version tag: `13`.",
          commandAnswer: "docker run postgres:13",
          explanation: "Adding `:<tag>` specifies which version of the image to run."
        },
        {
          id: "run-cmd-it",
          question: "Run the `StackBlueprint/name-prompt` image with an interactive pseudo-terminal so it can ask for your name.",
          commandAnswer: ["docker run -it StackBlueprint/name-prompt", "docker run -ti StackBlueprint/name-prompt", "docker run -i -t StackBlueprint/name-prompt"],
          explanation: "`-it` keeps stdin open (`-i`) and allocates a pseudo-TTY (`-t`), which is required for interactive prompts."
        },
        {
          id: "run-cmd-port",
          question: "Run the `StackBlueprint/simple-webapp` image, mapping port 80 on your host to port 5000 inside the container.",
          commandAnswer: ["docker run -p 80:5000 StackBlueprint/simple-webapp"],
          explanation: "`-p host_port:container_port` publishes the internal port to your external host interface."
        },
        {
          id: "run-cmd-volume",
          question: "Run the `postgres` image, mounting your host directory `/opt/pgdata` into `/var/lib/postgresql/data` inside the container.",
          commandAnswer: ["docker run -v /opt/pgdata:/var/lib/postgresql/data postgres"],
          explanation: "`-v host_dir:container_dir` persists data by keeping it on the host rather than inside the ephemeral container."
        },
        {
          id: "run-cmd-combo",
          question: "Run the `StackBlueprint/notes-api` image in the background (detached), map host port 3000 to container port 3000, and name the container `notes-api`.",
          commandAnswer: [
            "docker run -d -p 3000:3000 --name notes-api StackBlueprint/notes-api",
            "docker run -p 3000:3000 -d --name notes-api StackBlueprint/notes-api",
            "docker run --name notes-api -d -p 3000:3000 StackBlueprint/notes-api",
            "docker run -dp 3000:3000 --name notes-api StackBlueprint/notes-api"
          ],
          explanation: "You can combine multiple flags. `-d` runs it in the background, `-p` publishes ports, and `--name` gives it a friendly identifier."
        },
        {
          id: "run-cmd-attach",
          question: "Reattach your terminal to a background container named `notes-api`.",
          commandAnswer: "docker attach notes-api",
          explanation: "`docker attach` connects your local standard input, output, and error streams to a running container."
        },
        {
          id: "run-cmd-detach",
          question: "You are attached to a container's console. What keyboard combination safely detaches your terminal without stopping the container? (Type exactly as pressed, separated by a space)",
          commandAnswer: ["Ctrl+P Ctrl+Q", "ctrl+p ctrl+q", "Ctrl-P Ctrl-Q", "ctrl-p ctrl-q", "Ctrl+P, Ctrl+Q"],
          explanation: "`Ctrl+P` followed by `Ctrl+Q` escapes the session, leaving the container running in the background."
        }
      ]
    }
  ]
};


import { IMAGES_CONTAINERS_TOPICS } from "./images-containers-content";

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
      terminalPrerequisites,
      settingUpDocker,
      dockerArchitecture,
      yourFirstContainer,
      basicDockerCommands,
      dockerRunCommands,
    ],
  },
  ...IMAGES_CONTAINERS_TOPICS,
};
