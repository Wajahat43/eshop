import { ArrowRight, ShoppingCart } from 'lucide-react';
import React from 'react';

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background to-secondary opacity-50"></div>
        <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-r from-primary via-accent to-secondary opacity-20"></div>
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-Poppins text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <span className="block">Welcome to</span>
          <span className="block text-primary">NextCart</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-xl text-muted-foreground sm:max-w-3xl">
          Discover the future of online shopping. Unbeatable prices, futuristic tech, and a seamless experience.
        </p>
        <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
          <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <a
              href="#"
              className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 sm:px-8"
            >
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-base font-medium text-card-foreground shadow-sm hover:bg-accent sm:px-8"
            >
              Explore <ShoppingCart className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
