import { type LessonContent } from "@/lessons/types";
import { type FoundationTopicMeta } from "@/lessons/docker/foundations-content";

const whatIsImage: LessonContent = {
  slug: "what-is-a-docker-image",
  title: "What is a Docker Image?",
  subtitle: "Layers, tags, and how they differ from containers.",
  sections: [],
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
