'use client';

import React from 'react';
import { AlignLeft, ChevronDown } from 'lucide-react';
import { navItems } from 'apps/user-ui/src/configs/constants';
import Link from 'next/link';
import ActionItems from './action-items';
import useUser from 'apps/user-ui/src/hooks/userUser';

const HeaderBottom = () => {
  const [show, setShow] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);
  // const { user } = useUser();

  //Track scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 z-[100] shadow-lg h-20' : 'relative'
      } `}
    >
      <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'pt-0'}`}>
        {/**All Dropdowns */}
        <div
          className={`w-[260px] ${
            isSticky && '-mb-2'
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-primary`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft />
            <span className="text-foreground font-medium">All Departments </span>
          </div>
          <ChevronDown />
        </div>
        {/**Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? 'top-[70px]' : 'top-[50px]'
            } min-w-[260px] min-h-[400px] bg-muted text-muted-foreground`}
          />
        )}

        {/** Navigation Links */}
        <div className="flex gap-8 items-center">
          {navItems.map((item, index) => (
            <Link className="px-2 font-medium text-lg" key={index} href={item.href}>
              {item.title}
            </Link>
          ))}
        </div>

        {/** */}
        {isSticky && <ActionItems />}
      </div>
    </div>
  );
};

export default HeaderBottom;
