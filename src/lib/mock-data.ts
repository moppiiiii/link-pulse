import type { Article, Category, FeedSource } from "./types";

export const defaultCategories: Category[] = [
  { id: "frontend", name: "frontend", label: "Frontend", enabled: true },
  { id: "backend", name: "backend", label: "Backend", enabled: true },
  { id: "devops", name: "devops", label: "DevOps", enabled: true },
  { id: "ai", name: "ai", label: "AI / ML", enabled: true },
  { id: "career", name: "career", label: "Career", enabled: false },
  { id: "security", name: "security", label: "Security", enabled: false },
];

export const defaultSources: FeedSource[] = [
  {
    id: "1",
    name: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    category: "frontend",
    enabled: true,
  },
  {
    id: "2",
    name: "Dev.to",
    url: "https://dev.to/feed",
    category: "frontend",
    enabled: true,
  },
  {
    id: "3",
    name: "CSS Tricks",
    url: "https://css-tricks.com/feed/",
    category: "frontend",
    enabled: true,
  },
  {
    id: "4",
    name: "Smashing Magazine",
    url: "https://www.smashingmagazine.com/feed/",
    category: "frontend",
    enabled: true,
  },
  {
    id: "5",
    name: "InfoQ",
    url: "https://www.infoq.com/feed/",
    category: "backend",
    enabled: true,
  },
  {
    id: "6",
    name: "The New Stack",
    url: "https://thenewstack.io/feed/",
    category: "devops",
    enabled: true,
  },
  {
    id: "7",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    category: "ai",
    enabled: true,
  },
];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "React Server Components: A Deep Dive into the Future of React",
    description:
      "Server Components represent a fundamental shift in how we think about React applications. This comprehensive guide explores the mental model, implementation details, and best practices.",
    url: "https://example.com/rsc-deep-dive",
    source: "Dev.to",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: "frontend",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "2",
    title: "Building Type-Safe APIs with tRPC and Next.js 15",
    description:
      "Learn how to create end-to-end type safety between your frontend and backend using tRPC, eliminating the need for manual type definitions.",
    url: "https://example.com/trpc-nextjs",
    source: "Smashing Magazine",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: "frontend",
    isFavorite: true,
    isRead: false,
  },
  {
    id: "3",
    title: "Kubernetes 1.30: What's New and Migration Guide",
    description:
      "The latest Kubernetes release brings significant improvements to resource management, security policies, and developer experience. Here's everything you need to know.",
    url: "https://example.com/k8s-130",
    source: "The New Stack",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: "devops",
    isFavorite: false,
    isRead: true,
  },
  {
    id: "4",
    title: "Understanding LLM Fine-tuning: From Theory to Production",
    description:
      "A practical guide to fine-tuning large language models for your specific use case, including data preparation, training strategies, and deployment considerations.",
    url: "https://example.com/llm-finetuning",
    source: "MIT Technology Review",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: "ai",
    isFavorite: true,
    isRead: false,
  },
  {
    id: "5",
    title: "The Complete Guide to CSS Container Queries",
    description:
      "Container queries are finally here with full browser support. Learn how to build truly responsive components that adapt to their container, not just the viewport.",
    url: "https://example.com/container-queries",
    source: "CSS Tricks",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    category: "frontend",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "6",
    title: "Distributed Systems Patterns: Event Sourcing vs CQRS",
    description:
      "When should you use Event Sourcing? When is CQRS the right choice? This article compares both patterns with real-world examples and trade-off analysis.",
    url: "https://example.com/event-sourcing-cqrs",
    source: "InfoQ",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: "backend",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "7",
    title: "Modern State Management in React: Zustand vs Jotai vs Signals",
    description:
      "A comprehensive comparison of the latest React state management solutions, with performance benchmarks and use-case recommendations.",
    url: "https://example.com/state-management",
    source: "Dev.to",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    category: "frontend",
    isFavorite: false,
    isRead: true,
  },
  {
    id: "8",
    title: "GitOps with ArgoCD: Complete Production Setup",
    description:
      "Step-by-step guide to implementing GitOps workflows using ArgoCD, including multi-cluster management, secret handling, and progressive delivery.",
    url: "https://example.com/argocd-gitops",
    source: "The New Stack",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: "devops",
    isFavorite: true,
    isRead: false,
  },
  {
    id: "9",
    title: "WebGPU: The Future of High-Performance Graphics on the Web",
    description:
      "WebGPU is set to revolutionize browser-based graphics and compute. Learn about its architecture, API design, and how it compares to WebGL.",
    url: "https://example.com/webgpu-guide",
    source: "Smashing Magazine",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    category: "frontend",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "10",
    title: "Prompt Engineering: Advanced Techniques for Production AI",
    description:
      "Beyond basic prompting - learn about chain-of-thought, few-shot learning, and structured outputs for building reliable AI-powered applications.",
    url: "https://example.com/prompt-engineering",
    source: "MIT Technology Review",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    category: "ai",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "11",
    title: "Building Resilient Microservices with Circuit Breakers",
    description:
      "Implement fault tolerance in your microservices architecture using circuit breaker patterns, with examples in Node.js and Go.",
    url: "https://example.com/circuit-breakers",
    source: "InfoQ",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    category: "backend",
    isFavorite: false,
    isRead: false,
  },
  {
    id: "12",
    title: "The Rise of Edge Computing: Architecture Patterns and Use Cases",
    description:
      "Explore how edge computing is changing application architecture, with practical patterns for deploying compute closer to users.",
    url: "https://example.com/edge-computing",
    source: "The New Stack",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    category: "devops",
    isFavorite: false,
    isRead: true,
  },
];
