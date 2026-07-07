import { type LessonContent } from "@/lessons/types";
import { type FoundationTopicMeta } from "@/lessons/docker/foundations-content";

import dockerImageImg from "@/images/docker/images-and-containers/docker-image.png";
import multiStageBuildImg from "@/images/docker/images-and-containers/multi-stage-build.png";

const whatIsImage: LessonContent = {
  slug: "what-is-a-docker-image",
  title: "What is a Docker Image?",
  subtitle: "The blueprint you build once and the container you can start a thousand times.",
  sections: [
    {
      kind: "prose",
      heading: "An image is not a container",
      body: [
        "Every container you've run so far, whether it's `hello-world`, an Ubuntu shell, or Nginx, started from something. That something is a **Docker image**. An image is a read-only template that packages an application's filesystem, libraries, dependencies, configuration, and everything else it needs to run.",
        "Think of an image as the blueprint for a house. The blueprint never becomes a house itself. It simply describes how to build one. Every time Docker creates a container, it is like constructing a new house from the same blueprint. Each house can be lived in independently, but the blueprint never changes.",
        "If you're familiar with object-oriented programming, you can think of an image as a **class** and a container as an **instance** of that class.",
        "An image never runs by itself. It simply exists on your computer or in a container registry such as Docker Hub, waiting to be used. When you run:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run nginx"
    },
    {
      kind: "prose",
      body: [
        "Docker takes the `nginx` image, adds a thin writable layer on top of it, and creates a container.",
        "Any files you create, logs you generate, or changes you make while the container is running are stored only in that writable layer. If you remove the container, those changes disappear unless they were stored somewhere persistent, such as a Docker volume, which we'll cover later.",
        "The original image underneath never changes. That is why you can start ten containers from the same image and each one runs independently without affecting the others."
      ]
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "Docker images are **immutable**. Once an image has been built, its contents never change. If you need to update your application or install new software, you build a new image instead of modifying the existing one. This makes deployments predictable, repeatable, and easy to reproduce."
    },
    {
      kind: "image",
      src: dockerImageImg,
      alt: "Layered Docker image showing base layers, dependencies, and app code",
      caption: "A Docker image is a stacked, immutable blueprint for containers",
    },
    {
      kind: "prose",
      heading: "What's actually inside an image?",
      body: [
        "A Docker image contains almost everything an application needs to run, including:",
        "• **Your application code**",
        "• **An operating system filesystem**",
        "• **Libraries and dependencies**",
        "• **Runtime environments** such as Python, Java, or Node.js",
        "• **Configuration files**",
        "• **Image metadata**, such as the default command to run",
        "One thing an image does **not** contain is the operating system kernel.",
        "Unlike virtual machines, Docker containers share the host machine's kernel. Because of this, containers are much lighter than virtual machines. They use fewer resources and usually start in just a few seconds.",
        "Since an image packages everything except the kernel, the same image can run consistently on a developer's laptop, a testing environment, or a production server without needing to be changed."
      ]
    },
    {
      kind: "prose",
      heading: "Where do images come from?",
      body: [
        "Most Docker images come from one of two places."
      ]
    },
    {
      kind: "prose",
      heading: "1. Download an existing image",
      body: [
        "Many developers start by downloading pre-built images from a container registry such as Docker Hub.",
        "Examples include:\n\n **nginx**,\n **ubuntu**,\n **postgres**, and \n **redis**",
        "These images are maintained by software vendors or the open source community and are ready to use."
      ]
    },
    {
      kind: "prose",
      heading: "2. Build your own image",
      body: [
        "When you're developing your own application, you'll write a **Dockerfile**. A Dockerfile contains instructions that tell Docker how to build your image.",
        "Docker executes those instructions and packages your application into a reusable image.",
        "Whether an image is downloaded from Docker Hub or built from your own Dockerfile, Docker treats them exactly the same. Both are reusable templates that can be used to create containers."
      ]
    },
    {
      kind: "prose",
      heading: "Layers: how an image is built",
      body: [
        "A Docker image is not one large file. Instead, it is made up of a stack of read-only layers.",
        "Most filesystem-changing Dockerfile instructions, such as `RUN`, `COPY`, and `ADD`, create new filesystem layers. Other instructions, such as `CMD`, `ENTRYPOINT`, and `ENV`, store metadata instead of creating filesystem layers.",
        "Consider this Dockerfile:"
      ]
    },
    {
      kind: "code",
      language: "dockerfile",
      code: "FROM ubuntu\nRUN apt-get update && apt-get install -y python3\nRUN pip install flask\nCOPY . /opt/source-code"
    },
    {
      kind: "prose",
      body: [
        "Docker begins with the layers from the Ubuntu base image and then adds new layers as it processes each instruction."
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "Application Code\nCOPY . /opt/source-code\n\nPython Packages\nRUN pip install flask\n\nUbuntu Packages\nRUN apt-get update && apt-get install -y python3\n\nUbuntu Base Image\nFROM ubuntu"
    },
    {
      kind: "prose",
      body: [
        "When you start a container, Docker adds one final writable layer on top."
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "┌──────────────────────────────┐\n│ Writable Container Layer     │\n├──────────────────────────────┤\n│ Application Code             │\n├──────────────────────────────┤\n│ Python Packages              │\n├──────────────────────────────┤\n│ Ubuntu Packages              │\n├──────────────────────────────┤\n│ Ubuntu Base Image            │\n└──────────────────────────────┘"
    },
    {
      kind: "prose",
      body: [
        "The image layers are read-only and can be shared by every container created from that image. Only the writable layer belongs to a specific container."
      ]
    },
    {
      kind: "prose",
      heading: "Why layers matter",
      body: [
        "Layers provide two major benefits."
      ]
    },
    {
      kind: "prose",
      heading: "Storage efficiency",
      body: [
        "Docker stores each layer only once on your machine.",
        "Imagine you build three different images that all start with the Ubuntu base image."
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "Image A          Image B          Image C\n├── Ubuntu       ├── Ubuntu       ├── Ubuntu\n├── Python       ├── Java         ├── Node.js\n└── App A        └── App B        └── App C"
    },
    {
      kind: "prose",
      body: [
        "Docker stores the Ubuntu layer only once. Every image references that shared layer, which saves disk space."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "Did you know?",
      body: "Some official base images are shared by millions of containers worldwide. Docker stores each shared layer only once on your machine, no matter how many images use it."
    },
    {
      kind: "prose",
      heading: "Faster rebuilds through layer caching",
      body: [
        "Docker also caches the layers it builds.",
        "Suppose you change a single line of application code. Docker does not need to rebuild the entire image. Instead, it reuses the unchanged layers from the cache and rebuilds only the changed layer and the layers that follow.",
        "This makes rebuilding images after small code changes much faster."
      ]
    },
    {
      kind: "prose",
      heading: "A quick preview of multi-stage builds",
      body: [
        "Later in the course, you'll learn about **multi-stage builds**.",
        "A multi-stage build lets you compile your application using large build tools in one stage and then copy only the finished application into a smaller production image.",
        "The final image contains only what is needed to run the application. This makes it smaller, faster to download, and more secure."
      ]
    },
    {
      kind: "image",
      src: multiStageBuildImg,
      alt: "Multi‑stage Docker build with separate builder and final runtime stages",
      caption: "Multi‑stage builds keep images lean by copying only final artifacts",
    },
    {
      kind: "prose",
      heading: "Tags: naming different versions of an image",
      body: [
        "When you type:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "nginx"
    },
    {
      kind: "prose",
      body: [
        "Docker assumes:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "nginx:latest"
    },
    {
      kind: "prose",
      body: [
        "The part after the colon is called the **tag**.",
        "For example:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "nginx:latest\nnginx:1.25\nnginx:1.25-alpine"
    },
    {
      kind: "prose",
      body: [
        "Although these images share the same repository name, they can be very different.",
        "They may use different versions of Nginx, different Linux distributions, different installed packages, or have completely different image sizes.",
        "A tag is simply a human-readable name for a particular version of an image."
      ]
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important",
      body: "The `latest` tag is not special. It is simply the default tag Docker uses when you do not specify one. Whether it points to the newest version depends entirely on how the image publisher manages it. In production environments, it is usually better to use a specific version such as `nginx:1.25` so deployments remain predictable."
    },
    {
      kind: "prose",
      heading: "Digests: the true identity of an image",
      body: [
        "Every Docker image also has a **digest**.",
        "A digest is a SHA256 hash that uniquely identifies the exact contents of an image.",
        "For example:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "sha256:3f1d7d..."
    },
    {
      kind: "prose",
      body: [
        "Unlike tags, digests never change.",
        "A few things to remember:",
        "• **Multiple tags can point to the same digest.**",
        "• **A tag can later point to a different digest if a newer image is published.**",
        "• **A digest always identifies one exact image.**",
        "If you need to guarantee that every environment runs the exact same image, use the digest instead of the tag."
      ]
    },
    {
      kind: "prose",
      heading: "The distinction that matters",
      body: [
        "A Docker image is immutable, reusable, and shared.",
        "A Docker container is a running instance created from that image.",
        "In practice, you'll build an image occasionally, but you'll create, stop, remove, and recreate containers many times. That separation between an unchanging image and disposable containers is one of Docker's biggest strengths."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "A Docker image is a read-only, immutable template used to create containers.",
        "Images package an application's code, dependencies, runtime, configuration, and filesystem.",
        "Images share the host operating system kernel instead of including their own kernel.",
        "Images usually come from a container registry or are built from a Dockerfile.",
        "A container is a running instance of an image with its own writable layer.",
        "Docker images are built from read-only layers that can be shared across many images and containers.",
        "Layer caching speeds up image rebuilds by reusing unchanged layers.",
        "Tags provide human-readable version names, while digests uniquely identify the exact contents of an image.",
        "In production, specific version tags or image digests are safer than relying on `latest`."
      ]
    },
    {
      kind: "prose",
      heading: "What's Next?",
      body: [
        "Now that you understand what a Docker image is, the next step is learning how to find, download, and inspect images. In the next lesson, you'll explore commands such as `docker pull`, `docker image ls`, `docker inspect`, and `docker history` to see how Docker stores and manages images locally."
      ]
    }
  ],
};

const pullingImages: LessonContent = {
  slug: "pulling-and-inspecting-images",
  title: "Pulling and Inspecting Images",
  subtitle: "docker pull, docker image ls, docker inspect, and docker history.",
  sections: [],
};

const runningContainers: LessonContent = {
  slug: "running-containers",
  title: "Running Containers",
  subtitle: "docker run, interactive mode -it, detached mode -d, port mapping -p, and accessing localhost.",
  sections: [],
};

const containerLifecycle: LessonContent = {
  slug: "mastering-container-lifecycle",
  title: "Mastering the Container Lifecycle",
  subtitle: "create, start, stop, restart, --rm, --restart, docker ps -a, and container states.",
  sections: [],
};

const passingConfiguration: LessonContent = {
  slug: "passing-configuration",
  title: "Passing Configuration: ARG vs. ENV",
  subtitle: "Build-time variables with ARG and runtime variables with -e / ENV.",
  sections: [],
};

const debuggingContainers: LessonContent = {
  slug: "debugging-containers",
  title: "Debugging Containers",
  subtitle: "docker logs, docker exec, and accessing a shell.",
  sections: [],
};

const cleaningUp: LessonContent = {
  slug: "cleaning-up",
  title: "Cleaning Up Images and Containers",
  subtitle: "docker rm, docker rmi, docker system df, and docker system prune.",
  sections: [],
};

const writingDockerfile: LessonContent = {
  slug: "writing-a-dockerfile",
  title: "Writing a Dockerfile",
  subtitle: "The basics: FROM, RUN, COPY, and CMD.",
  sections: [],
};

const cmdVsEntrypoint: LessonContent = {
  slug: "cmd-vs-entrypoint",
  title: "CMD vs. ENTRYPOINT",
  subtitle: "Why they behave differently, and when to use each.",
  sections: [],
};

const imageBuilding: LessonContent = {
  slug: "image-building-caching",
  title: "Image Building & Caching",
  subtitle: "docker build, layer caching, and .dockerignore.",
  sections: [],
};

const publishingImages: LessonContent = {
  slug: "publishing-images",
  title: "Publishing Images",
  subtitle: "docker tag, docker push, and Docker Hub.",
  sections: [],
};

const imagesContainersQuiz: LessonContent = {
  slug: "images-containers-quiz",
  title: "Images & Containers Quiz",
  subtitle: "Testing the learned concepts.",
  sections: [],
};

export const IMAGES_CONTAINERS_TOPICS: Record<string, FoundationTopicMeta> = {
  "images-and-containers": {
    slug: "images-and-containers",
    title: "Images and Containers",
    category: "Foundations",
    iconKey: "layers",
    blurb:
      "Master the core lifecycle of Docker: building images, running containers, and debugging running environments.",
    lessons: [
      whatIsImage,
      pullingImages,
      runningContainers,
      containerLifecycle,
      passingConfiguration,
      debuggingContainers,
      cleaningUp,
      writingDockerfile,
      cmdVsEntrypoint,
      imageBuilding,
      publishingImages,
      imagesContainersQuiz,
    ],
  },
};
