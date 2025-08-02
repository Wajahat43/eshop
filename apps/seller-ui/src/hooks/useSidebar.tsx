'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { activeSideBarItem } from '../configs/constants';

const useSidebar = () => {
  const [activeSideBar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSideBar, setActiveSidebar };
};

export default useSidebar;
