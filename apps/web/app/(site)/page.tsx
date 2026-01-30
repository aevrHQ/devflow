"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Github,
  CheckCircle2,
  Lock,
  Terminal,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-24 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs font-medium text-orange-700 dark:text-orange-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Public Beta
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
            The intelligent agent for your <br className="hidden md:block" />{" "}
            Webhooks & Infrastructure.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Powered by the new{" "}
            <Link
              href="https://github.com/features/copilot/cli"
              target="_blank"
              className="underline hover:text-foreground transition-colors"
            >
              <strong>GitHub Copilot CLI</strong>{" "}
            </Link>
            and{" "}
            <Link
              href="https://github.com/github/copilot-sdk"
              target="_blank"
              className="underline hover:text-foreground transition-colors"
            >
              <strong> SDK</strong>
            </Link>{" "}
            . <br className="hidden md:block" />
            Connect local agents to control your infrastructure securely from
            Telegram or Slack.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all hover:pr-6"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/miracleonyenma/devflow"
              target="_blank"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-border font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Github className="w-4 h-4" />
              Open Source
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Github className="w-6 h-6" />}
            title="Powered by Copilot"
            description="Built on the new GitHub Copilot SDK. Leveraging the intelligence of Copilot CLI for complex dev tasks."
          />
          <FeatureCard
            icon={<Terminal className="w-6 h-6" />}
            title="Remote Agent Control"
            description="Securely connect your local machine or servers using the @untools/devflow CLI."
          />
          <FeatureCard
            icon={<Bot className="w-6 h-6" />}
            title="Two-way ChatOps"
            description="Don't just receive alerts. Talk back to your infrastructure. Trigger workflows from chat."
          />
        </div>
      </section>

      {/* Powered by Copilot Section - Intentional Dark Theme */}
      <section className="bg-neutral-950 text-white py-24 border-y border-neutral-900">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Powered by <br />
                  <span className="">GitHub Copilot</span>
                </h2>
                <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                  DevFlow leverages the new{" "}
                  <Link
                    href="https://github.com/github/copilot-sdk"
                    target="_blank"
                    className="text-white hover:underline decoration-blue-400 decoration-2 underline-offset-4"
                  >
                    GitHub Copilot SDK
                  </Link>{" "}
                  (released Jan 2026) to give you an agent that truly
                  understands your code.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Copilot CLI Engine</h3>
                      <p className="text-sm text-neutral-500">
                        Uses{" "}
                        <Link
                          href="https://github.com/features/copilot/cli"
                          target="_blank"
                          className="hover:text-blue-400 transition-colors"
                        >
                          gh copilot
                        </Link>{" "}
                        to translate natural language into complex
                        infrastructure commands.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                      <Bot className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Agentic Workflows</h3>
                      <p className="text-sm text-neutral-500">
                        Execute multi-step tasks like &quot;fix this bug&quot;
                        or &quot;optimize my dockerfile&quot; directly from
                        Slack.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-[#0d1117] rounded-2xl border border-neutral-800 p-1 font-mono text-sm shadow-2xl">
                  <div className="bg-[#161b22] rounded-t-lg p-3 flex items-center gap-2 border-b border-neutral-800">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    <div className="ml-2 text-neutral-500 text-xs">
                      miracleio@devflow:~/project
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">➜</span>
                      <span className="text-blue-400">~</span>
                      <span className="text-neutral-300">npm install</span>
                      <span className="text-yellow-300">@untools/devflow</span>
                    </div>
                    <div className="text-neutral-500 pl-4 border-l-2 border-neutral-800">
                      <div>+ @untools/devflow@0.2.7</div>
                      <div>added 1 package and audited 42 packages in 2s</div>
                      <div className="text-green-500">
                        found 0 vulnerabilities
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">➜</span>
                      <span className="text-blue-400">~</span>
                      <span className="text-neutral-300">npx devflow init</span>
                    </div>
                    <div className="text-neutral-400">
                      <span className="text-green-400">✓</span> Authenticated
                      with GitHub Copilot <br />
                      <span className="text-green-400">✓</span> Connected to
                      agent hub <br />
                      <span className="text-blue-400">ℹ</span> Listening for
                      commands...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-24 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16 text-foreground">
              Simple by design
            </h2>
            <div className="space-y-12">
              <Step
                number="01"
                title="Connect"
                description="Log in with a magic link and connect your Telegram account with one click."
              />
              <Step
                number="02"
                title="Configure"
                description="Install the GitHub App or set up your unique email forwarding address."
              />
              <Step
                number="03"
                title="Receive"
                description="Get beautiful, structured notifications instantly on your devices."
              />
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Features */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Built for security
            </h2>
            <div className="space-y-6">
              <SecurityItem text="Passwordless Authentication via Magic Link" />
              <SecurityItem text="4-Digit PIN for quick access on trusted devices" />
              <SecurityItem text="Unique webhook endpoints for every user" />
              <SecurityItem text="Open source and self-hostable" />
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-8 aspect-square flex items-center justify-center">
            <div className="relative w-64 h-80 bg-card rounded-2xl shadow-2xl border border-border p-6 flex flex-col">
              <div className="w-8 h-8 bg-muted rounded-full mb-4" />
              <div className="space-y-3 flex-1">
                <div className="h-2 w-3/4 bg-muted rounded" />
                <div className="h-2 w-1/2 bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded mt-6" />
                <div className="h-2 w-full bg-muted rounded" />
              </div>
              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div className="bg-foreground text-background rounded-2xl p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Terminal className="w-64 h-64" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
            Start your AI-powered <br /> DevOps journey
          </h2>
          <p className="text-muted-foreground/60 mb-8 max-w-lg mx-auto text-lg relative z-10">
            Join developers who are using DevFlow and GitHub Copilot to automate
            their infrastructure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/dashboard"
              className="inline-block bg-background text-foreground px-8 py-4 rounded-full font-bold hover:bg-muted transition-colors"
            >
              Get Started for Free
            </Link>
            <Link
              href="https://github.com/miracleonyenma/devflow"
              target="_blank"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-neutral-700 font-medium hover:bg-neutral-800 transition-colors"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-6 text-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="text-4xl font-mono text-muted/30 font-bold group-hover:text-foreground transition-colors">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function SecurityItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <span className="text-muted-foreground font-medium">{text}</span>
    </div>
  );
}
