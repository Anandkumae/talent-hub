import { Button } from '@/components/ui/button';
import { Briefcase, Zap, Users, BarChart } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background border-b">
        <Link href="#" className="flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="sr-only">Internal Talent Hub</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Unlock Your Internal Talent Potential
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our platform helps you discover, manage, and hire the best
                    internal candidates for your open roles.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/login">Find Your Next Hire</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://picsum.photos/seed/hiring/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="office hiring"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Streamline Your Internal Hiring
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your internal talent pipeline, from
                  job posting to hiring decision.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                    <div className="bg-primary/10 rounded-lg p-4">
                        <Zap className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Quickly find the most relevant internal candidates with our smart
                  resume and job description analyzer.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center">
                    <div className="bg-primary/10 rounded-lg p-4">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Centralized Candidate Pool</h3>
                <p className="text-muted-foreground">
                  Manage all internal applications in one place. Track status, view
                  profiles, and collaborate with your team.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center">
                    <div className="bg-primary/10 rounded-lg p-4">
                        <BarChart className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Insightful Analytics</h3>
                <p className="text-muted-foreground">
                  Gain insights into your hiring process with our dashboard and
                  reporting tools.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is the Internal Talent Hub?</AccordionTrigger>
                  <AccordionContent>
                    The Internal Talent Hub is a comprehensive platform designed to streamline your internal recruitment process. It allows you to post jobs, manage a centralized pool of internal candidates, and leverage AI to find the best fit for your open roles, helping you build your future workforce from within.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the AI-powered matching work?</AccordionTrigger>
                  <AccordionContent>
                    Our advanced AI analyzes the job description and compares it against the text of candidate resumes. It calculates a match score based on skills, experience, and other relevant criteria, allowing you to quickly identify the most qualified internal applicants for a position.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I track the status of candidates through the hiring process?</AccordionTrigger>
                  <AccordionContent>
                    Yes! The platform provides a clear and intuitive dashboard to track each candidate's status, from "Applied" and "Shortlisted" to "Interviewed" and "Hired". This helps you and your team stay organized and informed at every stage of the hiring pipeline.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How can I create and manage job postings?</AccordionTrigger>
                  <AccordionContent>
                    Posting a new job is simple. Just navigate to the "Jobs" section and click "Create Job". You can fill in the title, department, description, and requirements. All your job postings can be viewed, edited, or archived from the same central location.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is my data and are my employees' resumes secure?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We prioritize the security and privacy of your company's and employees' data. The platform is built with robust security measures to ensure that all information, including resumes and candidate details, is kept confidential and accessed only by authorized personnel.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Revolutionize Your Internal Hiring?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join us and start building your future workforce from within.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">Get Started</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Sign up and start posting jobs in minutes.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Internal Talent Hub. All rights
          reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
