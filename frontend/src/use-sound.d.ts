declare module 'use-sound' {
  interface Options {
    volume?: number;
    playbackRate?: number;
    interrupt?: boolean;
    soundEnabled?: boolean;
    sprite?: { [key: string]: [number, number] };
    onload?: () => void;
  }

  type PlayFunction = (options?: Options) => void;
  type StopFunction = () => void;

  export default function useSound(
    url: string,
    options?: Options
  ): [PlayFunction, StopFunction];
}