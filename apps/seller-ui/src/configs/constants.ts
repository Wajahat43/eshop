import { atom } from 'jotai';
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const activeSideBarItem = atom<string>('/dashboard');
