import { type LessonContent } from "@/lessons/types";
import { type FoundationTopicMeta } from "@/lessons/docker/foundations-content";

import dockerImageImg from "@/images/docker/images-and-containers/docker-image.png";
import multiStageBuildImg from "@/images/docker/images-and-containers/multi-stage-build.png";
import pullingImagesImg from "@/images/docker/images-and-containers/pulling-and-inspecting-images.png";
import runningContainersImg from "@/images/docker/images-and-containers/docker-running-containers.png";
import containerLifecycleImg from "@/images/docker/images-and-containers/master_the_container_lifecycle.png";
import imgvsContainerImg from "@/images/docker/images-and-containers/images-vs-containers.png";

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
        "A Docker container is a running instance created from that image."
      ]
    },

    {
      kind: "image",
      src: imgvsContainerImg,
      alt: "Image vs Container",
      caption: "Image vs Container",
    },

    {
      kind: "prose",
      body: [
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
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "what-is-image-q1",
          question: "What is a Docker Image?",
          options: [
            "A running instance of an application",
            "A virtual machine containing the host OS kernel",
            "A read-only template used to create containers",
            "A writable layer where application logs are stored",
          ],
          correctIndex: 2,
          explanation: "An image is a read-only template that packages everything an application needs to run. A running instance is called a container.",
        },
        {
          id: "what-is-image-q2",
          question: "Which of the following is NOT included in a Docker Image?",
          options: [
            "Application code",
            "Operating system kernel",
            "Libraries and dependencies",
            "Configuration files",
          ],
          correctIndex: 1,
          explanation: "Unlike virtual machines, Docker containers share the host machine's kernel. The image contains everything else (code, libraries, OS filesystem).",
        },
        {
          id: "what-is-image-q3",
          question: "What happens to the underlying Docker image when a container is running?",
          options: [
            "It is modified to include any new files created by the container",
            "It remains completely unchanged and read-only",
            "It is temporarily deleted until the container stops",
            "It merges with the writable layer permanently",
          ],
          correctIndex: 1,
          explanation: "Images are immutable (read-only). When a container runs, Docker adds a thin writable layer on top of the image for any changes.",
        },
        {
          id: "what-is-image-q4",
          question: "Why do Docker containers start so quickly compared to Virtual Machines?",
          options: [
            "They load a smaller kernel into memory",
            "They share the host machine's kernel instead of booting their own",
            "They skip checking for software updates",
            "They do not contain any application dependencies",
          ],
          correctIndex: 1,
          explanation: "Containers don't need to boot a separate operating system kernel. They share the host's kernel, making them lightweight and extremely fast to start.",
        },
        {
          id: "what-is-image-q5",
          question: "Which of the following provides a unique, unchangeable identifier for a specific Docker image?",
          options: [
            "The image tag (e.g., `latest`)",
            "The image repository name",
            "The image digest (e.g., `sha256:...`)",
            "The image writable layer",
          ],
          correctIndex: 2,
          explanation: "Tags can point to different images over time, but an image digest (a SHA256 hash) always identifies the exact contents of an image and never changes.",
        }
      ]
    }
  ],
};

const pullingImages: LessonContent = {
  slug: "pulling-and-inspecting-images",
  title: "Pulling and Inspecting Images",
  subtitle: "Download it. Explore it. Understand it before you run it.",
  sections: [
    {
      kind: "prose",
      heading: "Pulling an image",
      body: [
        "In the previous lesson, you learned that running:",
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
        "automatically downloads the image if it doesn't already exist on your machine.",
        "Docker first checks your local image cache. If the image isn't found, it downloads the image and then starts the container.",
        "Before pulling an image, you might want to search Docker Hub to see what's available. The `docker search` command lets you do exactly that from your terminal:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker search nginx",
      output: `NAME                                     DESCRIPTION                                     STARS     OFFICIAL
nginx                                    Official build of Nginx.                        21333     [OK]
nginx/nginx-ingress                      NGINX and  NGINX Plus Ingress Controllers fo…   121       
nginx/nginx-prometheus-exporter          NGINX Prometheus Exporter for NGINX and NGIN…   52        
nginx/nginx-ingress-operator             NGINX Ingress Operator for NGINX and NGINX P…   4         
nginx/nginxaas-loadbalancer-kubernetes                                                   1         
bitnamicharts/nginx                      Bitnami Helm chart for NGINX Open Source        4         
ubuntu/nginx                             Nginx, a high-performance reverse proxy & we…   141       
kasmweb/nginx                            An Nginx image based off nginx:alpine and in…   9         
rancher/nginx                                                                            4         
linuxserver/nginx                        An Nginx container, brought to you by LinuxS…   236       
dtagdevsec/nginx                         T-Pot Nginx                                     0         
paketobuildpacks/nginx                                                                   0         
vmware/nginx                                                                             3         
gluufederation/nginx                      A customized NGINX image containing a consu…   1         
cleanstart/nginx                         Secure by Design, Built for Speed, Hardened …   0         
antrea/nginx                             Nginx server used for Antrea e2e testing        0         
activestate/nginx                        ActiveState's customizable, low-to-no vulner…   0         
intel/nginx                                                                              0         
docksal/nginx                            Nginx service image for Docksal                 1         
geokrety/nginx                           Our customized nginx image                      0         
circleci/nginx                           This image is for internal use                  2         
ilios/nginx                              Nginx customized to run Ilios along with the…   0         
corpusops/nginx                          https://github.com/corpusops/docker-images/     1         
wayofdev/nginx                           Nginx Docker image for PHP development. SSL-…   0         
dockette/nginx                           Nginx SSL / HSTS / HTTP2                        3`,
      buttonLabel: "Run Command",
      caption: "Searching for images (Note: Your output may vary based on your system.)",
    },
    {
      kind: "prose",
      body: [
        "Once you've found what you need, you might want to download an image without running it yet. That's exactly what \`docker pull\` does:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker pull nginx",
      output: `Using default tag: latest
latest: Pulling from library/nginx
fc7181108d40: Pull complete
d2e987ca2267: Pull complete
0b760b431b11: Pull complete
Digest: sha256:96fb261b66270b900ea5a2c17a26abbfabe95506e73c3a3c65869a6dbe83223a
Status: Downloaded newer image for nginx:latest`,
      buttonLabel: "Run Command",
      caption: "Pulling an image (Note: Your output may vary based on your system.)",
    },
    {
      kind: "prose",
      body: [
        "Each hash represents one image layer being downloaded. These are the same read-only layers you learned about in the previous lesson.",
        "If you already have the latest version of an image on your machine, running `docker pull` again usually downloads nothing. Docker compares the layers you already have with those available in the registry and downloads only what is missing or has changed.",
        "However, tags like `:latest` are mutable. If a developer pushes a new build to `:latest` on Docker Hub, running `docker pull` will actually pull down the new layers. In this way, `docker pull` acts as an update mechanism to ensure you have the absolute newest version of that tag."
      ]
    },
    {
      kind: "image",
      src: pullingImagesImg,
      alt: "Diagram showing how docker pull downloads an image",
      caption: "Downloading an image from a registry to your local machine",
    },
    {
      kind: "prose",
      heading: "Official images and organization repositories",
      body: [
        "When you run:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker pull nginx"
    },
    {
      kind: "prose",
      body: [
        "Docker downloads the **official Nginx image** from Docker Hub.",
        "Official images are maintained by Docker or trusted software maintainers and don't include a username or organization name.",
        "In many companies, you'll also work with images published by your own organization.",
        "For example:"
      ]
    },
    {
      "kind": "code",
      "language": "bash",
      "code": "docker pull your-org/payment-service:2.3.1\n\n# Or, using a hypothetical example:\ndocker pull stackblueprint/python-api:v1.0.0"
    },
    {
      kind: "prose",
      body: [
        "In these examples:",
        "• **`your-org` or `stackblueprint`** is the repository owner.",
        "• **`payment-service` or `python-api`** is the image repository.",
        "• **`2.3.1` or `v1.0.0`** is the image tag.",
        "This is very common in real-world environments where teams build and publish their own Docker images instead of relying only on public images."
      ]
    },
    {
      kind: "prose",
      heading: "Pulling a specific version",
      body: [
        "If you don't specify a tag, Docker automatically assumes the `latest` tag.",
        "Sometimes you'll want a particular version instead."
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker pull postgres:15",
      output: `15: Pulling from library/postgres
02fb38419074: Pull complete 
637cfd629adc: Pull complete 
f135cbce02ee: Pull complete 
f71c554003ad: Pull complete 
4a07789739d1: Pull complete 
1f311e7bf767: Pull complete 
08c3b06ea11d: Pull complete 
9a10bad9d287: Pull complete 
07b8b7cb9076: Pull complete 
2f1f0f30a994: Pull complete 
1414a1aa0a9e: Pull complete 
3be819c1c8cf: Pull complete 
0e32887241a5: Pull complete 
3a90f5bef7ca: Pull complete 
82707ce10f85: Download complete 
10113bcc19b5: Download complete 
Digest: sha256:bcab099bfaab33333a73a2ebe8c1d615c9f4c2402dd43452f989a36c6da9a5ba
Status: Downloaded newer image for postgres:15
docker.io/library/postgres:15

What's next:
    View a summary of image vulnerabilities and recommendations → docker scout quickview postgres:15`,
      buttonLabel: "Run Command",
      caption: "Pulling a specific version (Note: Your output may vary based on your system.)",
    },
    {
      kind: "prose",
      body: [
        "Using specific version tags makes deployments more predictable because everyone runs the same version of the software."
      ]
    },
    {
      kind: "prose",
      heading: "Viewing your local images",
      body: [
        "Once you've downloaded a few images, you can see everything stored on your machine with `docker images` or `docker image ls` :"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker images",
      output: `REPOSITORY   TAG      IMAGE ID       CREATED        SIZE
postgres     15       f076c2fa35f5   15 months ago  300MB
postgres     10.3     cbb7481ff9d5   4 years ago    232MB
nginx        latest   605c77e624dd   2 months ago   141MB`,
      buttonLabel: "Run Command",
      caption: "Viewing local images (Note: Your output may vary based on your system.)",
    },
    {
      kind: "prose",
      body: [
        "You can also use `docker image ls` which does exactly the same thing."
      ]
    },
    {
      kind: "prose",
      body: [
        "Notice that `postgres` appears twice.",
        "The repository name is the same, but each tag points to a different version of the image.",
        "You may also notice the **IMAGE ID** column.",
        "Earlier, you learned about image **digests**. While they both look like hashes, they are different:",
        "• **The IMAGE ID** is a shortened identifier Docker uses locally.",
        "• **The digest** uniquely identifies the exact image contents across registries."
      ]
    },
    {
      kind: "prose",
      heading: "Looking inside an image with docker inspect",
      body: [
        "Listing an image tells you that it exists.",
        "Inspecting an image tells you how it is configured.",
        "Run:"
      ]
    },
    {
      kind: "terminal-animation",
      command: "docker inspect nginx",
      output: `[
    {
        "Id": "sha256:605c77e624ddb75e6110f997c58876baa13f8754486b461117934b24a9dc3a85",
        "RepoTags": [
            "nginx:latest"
        ],
        "Config": {
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.25.3"
            ]
        }
        ...
    }
]`,
      buttonLabel: "Run Command",
      caption: "Inspecting an image (Note: Your output may vary based on your system.)",
    },
    {
      kind: "prose",
      body: [
        "**A crucial note on inspect:** `docker inspect` works on containers, images, volumes, and networks. If you accidentally name a container the exact same thing as an image (e.g., a container named `nginx` running the `nginx` image), Docker might return the container's data instead of the image's data. To prevent bugs, it is a best practice to explicitly declare the type:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "# Use the dedicated command:\ndocker image inspect nginx\n\n# Or explicitly declare the type:\ndocker inspect --type=image nginx"
    },
    {
      kind: "prose",
      body: [
        "Docker returns a large JSON document containing information such as:",
        "• Environment variables",
        "• Default command",
        "• Entrypoint",
        "• Exposed ports",
        "• Labels",
        "• Architecture",
        "• Operating system",
        "• Layer information",
        "This command is especially useful when you're trying to understand how an image was built or troubleshoot unexpected behavior."
      ]
    },
    {
      kind: "prose",
      heading: "Reading only what you need",
      body: [
        "The JSON output can be overwhelming.",
        "Instead of reading hundreds of lines, you can extract a single value with the `--format` option.",
        "For example, to display the **default command**:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker inspect --format='{{.Config.Cmd}}' nginx"
    },
    {
      kind: "prose",
      body: [
        "To display the **operating system**:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker inspect --format='{{.Os}}' nginx"
    },
    {
      kind: "prose",
      body: [
        "To display the **CPU architecture**:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker inspect --format='{{.Architecture}}' nginx"
    },
    {
      kind: "prose",
      body: [
        "Don't worry about the template syntax yet. The important idea is that `--format` lets you display only the information you care about."
      ]
    },
    {
      kind: "prose",
      heading: "Understanding an image's history",
      body: [
        "Every Docker image keeps a record of how it was built.",
        "You can view that history with:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker history nginx"
    },
    {
      kind: "prose",
      body: [
        "Example output:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "IMAGE          CREATED        CREATED BY                                  SIZE\n605c77e624dd   2 months ago   CMD [\"nginx\" \"-g\" \"daemon off;\"]             0B\n<missing>      2 months ago   EXPOSE 80/tcp                                0B\n<missing>      2 months ago   COPY docker-entrypoint.sh /                  1.2kB"
    },
    {
      kind: "prose",
      body: [
        "Each row represents one layer or build step.",
        "Don't worry if you see `<missing>` in the output. Modern versions of Docker optimize how image layers are stored, so some intermediate layer IDs are no longer displayed. The layers are still part of the image.",
        "The history command is useful for understanding how an image was built, identifying unusually large layers, or investigating why an image consumes more space than expected.",
        "It also teaches an important security lesson.",
        "If a developer accidentally includes a secret during the image build process, that information can become part of the image's history. Anyone who has access to the image may also be able to see that history.",
        "We'll revisit this topic later when we discuss build arguments, environment variables, and image security."
      ]
    },
    {
      kind: "prose",
      heading: "A typical workflow",
      body: [
        "When working with a new image, you'll often follow a workflow like this:"
      ]
    },
    {
      kind: "diagram",
      ascii: "docker pull\n      │\n      ▼\ndocker images\n      │\n      ▼\ndocker inspect\n      │\n      ▼\ndocker run",
      caption: "Common Docker image workflow"
    },
    {
      kind: "prose",
      body: [
        "Download the image, verify that you have the correct version, inspect its configuration if needed, and then create a container."
      ]
    },
    {
      kind: "table",
      caption: "Command Cheatsheet",
      headers: ["Command", "Description"],
      rows: [
        ["`docker pull <image>`", "Downloads an image from a registry"],
        ["`docker images` / `docker image ls`", "Lists all images stored locally on your machine"],
        ["`docker inspect <image>`", "Displays detailed configuration and metadata for an image"],
        ["`docker history <image>`", "Shows the layers and commands used to build an image"]
      ]
    },
    {
      kind: "takeaways",
      items: [
        "`docker pull <image>` downloads an image without creating a container.",
        "Pulling the same image again usually downloads only new or changed layers.",
        "Official images don't include a username or organization name, while private or company images usually do.",
        "Real-world teams commonly publish images under organization repositories such as `your-org/application:version`.",
        "`docker images` and `docker image ls` both list the images stored on your machine.",
        "`docker inspect` displays detailed information about an image, and `--format` lets you extract only the values you need.",
        "`docker history` shows the build history of an image and can help with debugging, optimization, and security reviews."
      ]
    },
    {
      kind: "prose",
      heading: "What's Next?",
      body: [
        "So far you've downloaded and explored Docker images, but an image by itself doesn't do anything.",
        "In the next lesson, you'll learn how to turn an image into a running container using `docker run`. You'll explore interactive mode (`-it`), detached mode (`-d`), port mapping (`-p`), and how to access applications through `localhost`."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "pulling-inspecting-q1",
          question: "What does the `docker pull` command do?",
          options: [
            "Downloads an image and immediately starts a container",
            "Downloads an image without starting a container",
            "Uploads an image to Docker Hub",
            "Builds a new image from a Dockerfile",
          ],
          correctIndex: 1,
          explanation: "`docker pull` only downloads the image layers to your local machine so it's ready to use.",
        },
        {
          id: "pulling-inspecting-q2",
          question: "Write the command to download the official `nginx` image without running it.",
          commandAnswer: "docker pull nginx",
          explanation: "The `docker pull` command downloads an image. For official images, you don't need a repository prefix.",
        },
        {
          id: "pulling-inspecting-q3",
          question: "What is the difference between an official image and an organization image?",
          options: [
            "Official images are faster to download",
            "Organization images cannot be run in production",
            "Official images do not include a username/org in their repository name (e.g., `nginx`)",
            "Organization images do not have tags",
          ],
          correctIndex: 2,
          explanation: "Official images (like `nginx` or `ubuntu`) are maintained centrally and omit the organization prefix. Organization images (like `your-org/app`) include the namespace.",
        },
        {
          id: "pulling-inspecting-q4",
          question: "Write the command to download version `15` of the `postgres` image.",
          commandAnswer: "docker pull postgres:15",
          explanation: "You append a colon and the tag to the image name to pull a specific version.",
        },
        {
          id: "pulling-inspecting-q5",
          question: "What happens if you run `docker pull` on an image you already have the latest version of?",
          options: [
            "It downloads the entire image again",
            "It deletes the old image and downloads the new one",
            "It compares layers and downloads nothing unless there are changes",
            "It throws an error",
          ],
          correctIndex: 2,
          explanation: "Docker layer caching ensures that it only downloads layers that you don't already have.",
        },
        {
          id: "pulling-inspecting-q6",
          question: "Write the command to list all Docker images stored locally on your machine.",
          commandAnswer: ["docker images", "docker image ls"],
          explanation: "Both `docker images` and `docker image ls` display a list of all images currently downloaded to your system.",
        },
        {
          id: "pulling-inspecting-q7",
          question: "In `docker images` output, what is the difference between an IMAGE ID and a digest?",
          options: [
            "IMAGE ID is used globally, digest is used locally",
            "IMAGE ID is a short local identifier, digest uniquely identifies exact contents across registries",
            "They are exactly the same thing",
            "IMAGE ID is a tag, digest is a label",
          ],
          correctIndex: 1,
          explanation: "The IMAGE ID is an identifier generated and used locally by your Docker engine, while the digest is a cryptographic hash (SHA256) used universally.",
        },
        {
          id: "pulling-inspecting-q8",
          question: "Write the command to view the detailed configuration and metadata for the `nginx` image.",
          commandAnswer: "docker inspect nginx",
          explanation: "`docker inspect` returns a large JSON document with detailed configurations like environment variables and open ports.",
        },
        {
          id: "pulling-inspecting-q9",
          question: "Why might you use the `docker history` command?",
          options: [
            "To view the shell commands executed inside a running container",
            "To delete all old and unused images from your computer",
            "To restart an image that has crashed",
            "To understand how an image was built or investigate unusually large layers",
          ],
          correctIndex: 3,
          explanation: "`docker history` shows each layer (or instruction) used to build the image, which helps with debugging size issues or checking for accidentally included secrets.",
        },
        {
          id: "pulling-inspecting-q10",
          question: "Write the command to extract only the CPU Architecture from the `nginx` image using `docker inspect`.",
          commandAnswer: ["docker inspect --format='{{.Architecture}}' nginx", "docker inspect -f '{{.Architecture}}' nginx", "docker inspect --format '{{.Architecture}}' nginx", "docker inspect -f='{{.Architecture}}' nginx", "docker inspect --format=\"{{.Architecture}}\" nginx", "docker inspect -f \"{{.Architecture}}\" nginx"],
          explanation: "You can use the `--format` (or `-f`) option with a template string `{{.Architecture}}` to avoid scrolling through the full JSON output.",
        }
      ]
    }
  ]
};

const runningContainers: LessonContent = {
  slug: "running-containers",
  title: "Running Containers",
  subtitle: "docker run, interactive mode -it, detached mode -d, port mapping -p, and accessing localhost.",
  sections: [
    {
      kind: "prose",
      body: [
        "This is the point where Docker becomes hands-on.",
        "An image is just a packaged blueprint until you start it as a container, and `docker run` is the command that makes that happen."
      ]
    },
    {
      kind: "prose",
      heading: "What docker run does",
      body: [
        "At its simplest, the command looks like this:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run <image>"
    },
    {
      kind: "prose",
      body: [
        "When you run that command, Docker does four things in order:",
        "1. It checks whether the image already exists on your machine.",
        "2. It pulls the image if it does not exist locally.",
        "3. It creates a new container from that image.",
        "4. It starts the container's main process."
      ]
    },
    {
      kind: "image",
      src: runningContainersImg,
      alt: "Diagram showing the four steps of docker run: check local cache, pull image if missing, create container, and start main process",
      caption: "The lifecycle of docker run from image to running container",
    },
    {
      kind: "prose",
      body: [
        "A quick first test is the `hello-world` image:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run hello-world"
    },
    {
      kind: "prose",
      body: [
        "This is a good confidence check because it proves Docker can download an image, create a container, start it, and print output to your terminal.",
        "When that message finishes, the container stops because its job is complete.",
        "To see it, list all containers, including stopped ones:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps -a"
    },
    {
      kind: "prose",
      body: [
        "You should see a `hello-world` container with a status like `Exited`."
      ]
    },
    {
      kind: "prose",
      heading: "Why containers sometimes stop immediately",
      body: [
        "Now try running Ubuntu without giving it an interactive session:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --name ubuntu-shell-check ubuntu"
    },
    {
      kind: "prose",
      body: [
        "At first, it may seem like nothing happened.",
        "Check again with:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps -a"
    },
    {
      kind: "prose",
      body: [
        "You will likely see a stopped container with `Exited (0)` in the status column:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "CONTAINER ID   IMAGE     COMMAND       STATUS                    NAMES\nb8f4c2d91a7e   ubuntu    \"/bin/bash\"   Exited (0) 8 seconds ago   ubuntu-shell-check"
    },
    {
      kind: "prose",
      body: [
        "That is expected behavior, not a failure.",
        "A container stays alive only while its main process is still running.",
        "In this case, the Ubuntu image starts a shell by default, but because no interactive terminal was attached, the shell had nothing to do and exited.",
        "Remove that stopped container before moving on:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm ubuntu-shell-check"
    },
    {
      kind: "prose",
      heading: "Run a command inside a container",
      body: [
        "You can tell Docker to run a specific command by placing it after the image name:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run ubuntu cat /etc/os-release"
    },
    {
      kind: "prose",
      body: [
        "This starts a container from the Ubuntu image, runs `cat /etc/os-release`, prints the operating system details, and then exits.",
        "For one-time commands, it is cleaner to remove the container automatically when it finishes:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --rm ubuntu cat /etc/os-release"
    },
    {
      kind: "prose",
      body: [
        "The `--rm` flag tells Docker to delete the container as soon as it exits, which is useful for quick experiments and temporary checks."
      ]
    },
    {
      kind: "prose",
      heading: "Use an explicit tag",
      body: [
        "If you do not specify a tag, Docker uses `latest` by default.",
        "For learning, it is better to be explicit so your result is predictable:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --rm ubuntu:24.04 cat /etc/os-release"
    },
    {
      kind: "prose",
      body: [
        "In `ubuntu:24.04`, the part after the colon is the tag.",
        "Tags let you choose a specific version or variant instead of depending on whatever `latest` happens to point to."
      ]
    },
    {
      kind: "prose",
      heading: "Use -it for an interactive shell",
      body: [
        "If you want to type commands inside a container, run it interactively:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -it --rm ubuntu bash"
    },
    {
      kind: "prose",
      body: [
        "The `-i` flag keeps standard input open, and the `-t` flag gives you a terminal session.",
        "Together, they let you work inside the container as if you had logged into a separate machine.",
        "Once inside, try a few simple commands:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "whoami\npwd\nls\ncat /etc/os-release"
    },
    {
      kind: "prose",
      body: [
        "When you are done, exit the shell:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "exit"
    },
    {
      kind: "prose",
      body: [
        "Because you included `--rm`, Docker removes the container as soon as the shell ends."
      ]
    },
    {
      kind: "prose",
      heading: "Use -d to run in the background",
      body: [
        "Interactive mode is great for exploration, but services like web servers usually need to keep running while your terminal stays free.",
        "Start Nginx in detached mode like this:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -d --name web-preview nginx:alpine"
    },
    {
      kind: "prose",
      body: [
        "The `-d` flag starts the container in the background and immediately returns control of your terminal.",
        "To confirm it is running:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps"
    },
    {
      kind: "prose",
      body: [
        "You should see `web-preview` with a status like `Up`."
      ]
    },
    {
      kind: "prose",
      heading: "Use -p to reach the container from your machine",
      body: [
        "Even though Nginx is running, your browser still cannot reach it yet because the web server is listening on port 80 inside the container, not directly on your computer.",
        "First remove the container you just started:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm -f web-preview"
    },
    {
      kind: "prose",
      body: [
        "Now start it again with a published port:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -d -p 8080:80 --name web-preview nginx:alpine"
    },
    {
      kind: "prose",
      body: [
        "Read `8080:80` as:",
        "`host-port:container-port`",
        "This means traffic sent to port 8080 on your machine gets forwarded to port 80 inside the container.",
        "Open this address in your browser:",
        "`http://localhost:8080`",
        "You should see the default Nginx welcome page.",
        "If port 8080 is already being used by something else, choose another host port:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -d -p 8081:80 --name web-preview-alt nginx:alpine"
    },
    {
      kind: "prose",
      body: [
        "Then open:",
        "`http://localhost:8081`"
      ]
    },
    {
      kind: "prose",
      heading: "Clean up and practice",
      body: [
        "When you are finished, remove the test container:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm -f web-preview"
    },
    {
      kind: "prose",
      body: [
        "If you also ran the alternate port example, remove that container too:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm -f web-preview-alt"
    },
    {
      kind: "prose",
      body: [
        "Try these commands and explain what each one does:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --rm alpine echo \"hello from alpine\"\ndocker run --rm ubuntu:24.04 cat /etc/os-release\ndocker run -it --rm ubuntu bash\ndocker run -d -p 8080:80 --name practice-web nginx:alpine\ndocker rm -f practice-web"
    },
    {
      kind: "prose",
      body: [
        "If you understand those five examples, you understand the most practical uses of `docker run` in beginner Docker work."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "`docker run <image>` creates and starts a new container from an image.",
        "If the image is not stored locally, Docker pulls it first.",
        "A container stops when its main process exits.",
        "A command placed after the image name overrides the image's default command.",
        "`--rm` removes the container automatically after it exits.",
        "`-it` gives you an interactive terminal session.",
        "`-d` runs a container in the background.",
        "`-p <host-port>:<container-port>` publishes a container port to your machine.",
        "`--name` gives the container a memorable name for later commands."
      ]
    },
    {
      kind: "prose",
      heading: "What's Next?",
      body: [
        "Now that you can run containers, the next step is learning how to manage them throughout their lifecycle.",
        "In the next lesson, you'll learn how to start, stop, and restart containers, view their logs, and clean up your system."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "running-containers-q1",
          question: "What does `docker run <image>` do if the image is not already on your machine?",
          options: [
            "It returns an error and stops.",
            "It automatically pulls the image from a registry, then creates and starts the container.",
            "It builds the image from a local Dockerfile.",
            "It starts a container with an empty image."
          ],
          correctIndex: 1,
          explanation: "Docker checks locally first. If it's missing, it automatically pulls it before running."
        },
        {
          id: "running-containers-q2",
          question: "Why did the container exit immediately when running `docker run ubuntu`?",
          options: [
            "The Ubuntu image is corrupted.",
            "Containers only stay alive while their main process is running, and the default shell had no interactive terminal attached.",
            "You must specify `-d` to run an Ubuntu container.",
            "The container crashed due to an out-of-memory error."
          ],
          correctIndex: 1,
          explanation: "The Ubuntu image starts a bash shell. Without an interactive terminal attached (`-it`), the shell immediately exits, so the container stops."
        },
        {
          id: "running-containers-q3",
          question: "Write the command to run an `ubuntu` container, print `/etc/os-release`, and automatically remove the container after it exits.",
          commandAnswer: "docker run --rm ubuntu cat /etc/os-release",
          explanation: "The `--rm` flag tells Docker to clean up the container once it stops."
        },
        {
          id: "running-containers-q4",
          question: "Which flags do you use to start an interactive terminal session inside a container?",
          options: [
            "-i and -t (or -it)",
            "-d and -p",
            "-r and -m (or --rm)",
            "-e and -v"
          ],
          correctIndex: 0,
          explanation: "`-i` keeps standard input open, and `-t` allocates a pseudo-TTY (terminal). Together (`-it`), they let you interact with the container."
        },
        {
          id: "running-containers-q5",
          question: "Write the command to run `nginx:alpine` in the background (detached mode) with the name `web-preview`.",
          commandAnswer: ["docker run -d --name web-preview nginx:alpine", "docker run --name web-preview -d nginx:alpine"],
          explanation: "The `-d` flag runs the container in detached mode, and `--name` assigns a custom name."
        },
        {
          id: "running-containers-q6",
          question: "When publishing ports with `-p 8080:80`, what does each number represent?",
          options: [
            "Container port : Host port",
            "Host port : Container port",
            "TCP port : UDP port",
            "Internal port : External port"
          ],
          correctIndex: 1,
          explanation: "The format is `<host-port>:<container-port>`, which means traffic to the host port is forwarded to the container port."
        },
        {
          id: "running-containers-q7",
          question: "Write the command to force remove a running container named `practice-web`.",
          commandAnswer: ["docker rm -f practice-web", "docker container rm -f practice-web"],
          explanation: "The `-f` (force) flag allows you to remove a running container without stopping it first."
        }
      ]
    }
  ],
};

const containerLifecycle: LessonContent = {
  slug: "mastering-container-lifecycle",
  title: "Mastering the Container Lifecycle",
  subtitle: "docker create vs run, container states (ps -a), stop & restart, exit codes, --rm cleanup, and --restart policies.",
  sections: [
    {
      kind: "image",
      src: containerLifecycleImg,
      alt: "Diagram showing container lifecycle states: created, running, paused, and exited",
      caption: "The core states of a Docker container lifecycle",
    },
    {
      kind: "prose",
      heading: "The states you need to know",
      body: [
        "A container usually moves through this simple lifecycle:"
      ]
    },
    {
      kind: "code",
      language: "text",
      code: "created -> running -> exited\n              |\n            paused"
    },
    {
      kind: "prose",
      body: [
        "The most common states you will see are:",
        "• **Created**: Docker prepared the container, but the process has not started.",
        "• **Up**: the container's main process is running.",
        "• **Exited**: the main process finished or stopped.",
        "Plain `docker ps` shows only running containers:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps"
    },
    {
      kind: "prose",
      body: [
        "To see everything:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps -a"
    },
    {
      kind: "prose",
      heading: "Create and start are separate ideas",
      body: [
        "Most of the time you use:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -d --name lifecycle-nginx nginx:alpine"
    },
    {
      kind: "prose",
      body: [
        "But `docker run` is really two steps in one:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker create --name lifecycle-created nginx:alpine\ndocker start lifecycle-created"
    },
    {
      kind: "prose",
      body: [
        "Try the separate version:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker create --name lifecycle-demo alpine sleep 300\ndocker ps -a"
    },
    {
      kind: "prose",
      body: [
        "You should see `lifecycle-demo` in the `Created` state.",
        "Start it:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker start lifecycle-demo\ndocker ps"
    },
    {
      kind: "prose",
      body: [
        "Now it should be `Up`."
      ]
    },
    {
      kind: "prose",
      heading: "Stop, start, and restart",
      body: [
        "Stop the running container:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker stop lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "The container is stopped, not deleted.",
        "Start it again:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker start lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "Restart it:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker restart lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "These commands change state. They do not remove the container."
      ]
    },
    {
      kind: "prose",
      heading: "Understand exit codes",
      body: [
        "Run a successful command:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --name success-demo alpine sh -c \"exit 0\""
    },
    {
      kind: "prose",
      body: [
        "Run a failing command:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --name fail-demo alpine sh -c \"exit 7\""
    },
    {
      kind: "prose",
      body: [
        "Now check:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps -a"
    },
    {
      kind: "prose",
      body: [
        "You should see `Exited (0)` for the first container and `Exited (7)` for the second. Exit codes are one of the first things to check when something fails.",
        "Clean them up:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm success-demo fail-demo"
    },
    {
      kind: "prose",
      heading: "Pause and unpause",
      body: [
        "Pause freezes a running container's processes without deleting the container:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker pause lifecycle-demo\ndocker ps"
    },
    {
      kind: "prose",
      body: [
        "Unpause resumes it:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker unpause lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "You will not use this every day as a beginner, but it helps you see that Docker can manage a container's state without rebuilding it."
      ]
    },
    {
      kind: "prose",
      heading: "Remove a container",
      body: [
        "To remove a stopped container:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker stop lifecycle-demo\ndocker rm lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "If you are working in a lab and intentionally want it gone immediately:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm -f lifecycle-demo"
    },
    {
      kind: "prose",
      body: [
        "`-f` stops it if needed and removes it."
      ]
    },
    {
      kind: "prose",
      heading: "--rm: do not leave throwaway containers behind",
      body: [
        "For one-off commands, use `--rm`:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --rm alpine echo \"no container left behind\""
    },
    {
      kind: "prose",
      body: [
        "Check:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker ps -a"
    },
    {
      kind: "prose",
      body: [
        "You will not see that container because Docker removed it after it exited."
      ]
    },
    {
      kind: "prose",
      heading: "--restart: make services recover",
      body: [
        "For services you expect to keep running, use a restart policy:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run -d --restart unless-stopped --name restart-nginx nginx:alpine"
    },
    {
      kind: "prose",
      body: [
        "Common policies:",
        "• `no`: never restart automatically. This is the default.",
        "• `on-failure`: restart only when the process exits with an error.",
        "• `always`: restart whenever it exits, including after Docker restarts.",
        "• `unless-stopped`: restart unless you manually stopped it.",
        "For local learning, `unless-stopped` is usually the least surprising policy for a long-running service.",
        "Clean up:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker rm -f restart-nginx"
    },
    {
      kind: "prose",
      heading: "Quick practice",
      body: [
        "Run this lifecycle drill:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker create --name sleepy alpine sleep 300\ndocker ps -a\ndocker start sleepy\ndocker ps\ndocker restart sleepy\ndocker stop sleepy\ndocker rm sleepy"
    },
    {
      kind: "prose",
      body: [
        "Then run a no-cleanup-needed command:"
      ]
    },
    {
      kind: "code",
      language: "bash",
      code: "docker run --rm alpine echo \"clean\""
    },
    {
      kind: "takeaways",
      items: [
        "`docker ps` shows running containers.",
        "`docker ps -a` shows running and stopped containers.",
        "`docker run` creates and starts a container.",
        "`docker create` prepares a container without starting it.",
        "`docker start`, `stop`, `restart`, `pause`, and `unpause` change container state.",
        "Exit codes tell you how the main process ended.",
        "`docker rm` removes a stopped container.",
        "`docker rm -f` force-removes a running container.",
        "`--rm` is ideal for one-off containers.",
        "`--restart` controls whether Docker brings a service back after it exits."
      ]
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "lifecycle-q1",
          question: "Which state indicates that a container has been prepared but its main process has not yet been started?",
          options: [
            "Up",
            "Created",
            "Exited",
            "Paused"
          ],
          correctIndex: 1,
          explanation: "The `Created` state means the container filesystem and config are ready, but the main process hasn't been launched."
        },
        {
          id: "lifecycle-q2",
          question: "Write the command that combines `docker create` and `docker start` into a single step.",
          commandAnswer: ["docker run", "docker run <image>"],
          explanation: "`docker run` both creates and starts a container from an image."
        },
        {
          id: "lifecycle-q3",
          question: "What does the `docker pause` command do?",
          options: [
            "Deletes the container temporarily",
            "Stops the container and removes its files",
            "Freezes the container's processes without stopping or deleting it",
            "Automatically restarts the container"
          ],
          correctIndex: 2,
          explanation: "Pausing freezes a container in its current state. You can later resume it with `docker unpause`."
        },
        {
          id: "lifecycle-q4",
          question: "Write the command to see all containers, including both running and stopped ones.",
          commandAnswer: "docker ps -a",
          explanation: "The `-a` (or `--all`) flag tells `docker ps` to show containers in any state, including `Exited` and `Created`."
        },
        {
          id: "lifecycle-q5",
          question: "What happens if a process exits with an exit code of `7` in a container?",
          options: [
            "The container goes into a `Paused (7)` state.",
            "The container is automatically deleted.",
            "The container stops, and `docker ps -a` will show `Exited (7)`.",
            "The container automatically restarts regardless of policies."
          ],
          correctIndex: 2,
          explanation: "When the main process finishes (successfully or with an error), the container transitions to the `Exited` state, keeping the exit code for debugging."
        },
        {
          id: "lifecycle-q6",
          question: "Which restart policy will restart a service only if it fails (exits with a non-zero exit code)?",
          options: [
            "always",
            "on-failure",
            "unless-stopped",
            "no"
          ],
          correctIndex: 1,
          explanation: "The `on-failure` policy automatically restarts the container if it exits with an error."
        }
      ]
    }
  ],
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
