"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Github, Mail, Phone, Linkedin, Globe, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SupportModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className="flex items-center w-full">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Support</span>
          </div>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">Developer Support</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
            <Image
              src="/img/developer-avatar.jpg"
              alt="Developer"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold">Your Name</h3>
            <p className="text-muted-foreground">Full Stack Developer</p>
          </div>

          <p className="text-center text-sm text-muted-foreground px-4">
            Need help or have questions? Feel free to reach out through any of the following channels.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <ContactButton
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value="your.email@example.com"
              href="mailto:your.email@example.com"
            />
            <ContactButton
              icon={<Phone className="h-5 w-5" />}
              label="Phone"
              value="+1 (555) 123-4567"
              href="tel:+15551234567"
            />
            <ContactButton
              icon={<Github className="h-5 w-5" />}
              label="GitHub"
              value="github.com/yourusername"
              href="https://github.com/yourusername"
            />
            <ContactButton
              icon={<Linkedin className="h-5 w-5" />}
              label="LinkedIn"
              value="linkedin.com/in/yourusername"
              href="https://linkedin.com/in/yourusername"
            />
            <ContactButton
              icon={<Globe className="h-5 w-5" />}
              label="Portfolio"
              value="yourportfolio.com"
              href="https://yourportfolio.com"
              colSpan="col-span-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactButton({ icon, label, value, href, colSpan = "" }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  href: string;
  colSpan?: string;
}) {
  return (
    <Link 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`${colSpan} group relative p-4 rounded-lg border hover:bg-accent/50 transition-colors`}
    >
      <div className="flex flex-col items-center text-center space-y-1">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs text-muted-foreground truncate w-full">{value}</span>
      </div>
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
    </Link>
  );
}
