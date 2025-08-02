'use client';

import styled from 'styled-components';

export const SidebarWrapper = styled.div`
  background-color: hsl(var(--sidebar));
  color: hsl(var(--sidebar-foreground));
  transition: all 0.2s ease;
  height: 100%;
  position: fixed;
  transform: translateX('-100%');
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid hsl(var(--sidebar-border));
  flex-direction: column;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  box-shadow: var(--shadow-lg);

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: hsl(var(--sidebar-border));
    border-radius: 2px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--sidebar-accent));
  }

  @media (min-width: 768px) {
    margin-left: 0;
    display: flex;
    height: 100vh;
    transform: translateX(0);
  }

  ${(props: any) =>
    props.collapsed &&
    `
      display: inherit;
      margin-left: 0;
      transform: translateX(0);
    `}
`;

export const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  inset: 0;
  z-index: 201;
  transition: opacity 0.3s ease;
  opacity: 1;
  backdrop-filter: blur(2px);

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1;
  }
`;

export const Header = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--sidebar-border));
  margin-bottom: 1rem;
  background: hsl(var(--sidebar-accent) / 0.1);
  border-radius: var(--radius);
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-top: 1px solid hsl(var(--sidebar-border));
  margin-top: auto;

  @media (min-width: 768px) {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`;

export const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Overlay,
  Footer,
};
