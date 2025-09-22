'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, CreditCard, Shield, Truck, RotateCcw, Heart, Lock } from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on inbox page
  if (pathname === '/inbox') {
    return null;
  }

  const footerSections = {
    shop: {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Latest Drops', href: '/offers' },
        { name: 'Top Shops', href: '/shops' },
      ],
    },
    account: {
      title: 'Account',
      links: [
        { name: 'My Profile', href: '/profile' },
        { name: 'My Cart', href: '/cart' },
        { name: 'Wishlist', href: '/wishlist' },
        { name: 'Inbox', href: '/inbox' },
      ],
    },
    auth: {
      title: 'Authentication',
      links: [
        { name: 'Login', href: '/login' },
        { name: 'Sign Up', href: '/signup' },
        { name: 'Forgot Password', href: '/forgot-password' },
      ],
    },
  };

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $50',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure checkout',
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: '24/7 support available',
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      {/* Features Section */}
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="mx-auto w-[90%] max-w-10xl py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto w-[90%] max-w-10xl py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold text-foreground">NextCart</h2>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Discover unique products from independent creators and established brands. Your one-stop destination for
              curated fashion, tech, and lifestyle essentials.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@nextcart.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto w-[90%] max-w-10xl py-6">
          <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between">
            <div className="flex items-center gap-6">
              <span>© {currentYear} NextCart. All rights reserved.</span>
              <div className="hidden items-center gap-4 sm:flex">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Secure payments</span>
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>SSL encrypted</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Built with Next.js & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
