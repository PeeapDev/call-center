declare module 'ari-client' {
  export function connect(
    url: string,
    username: string,
    password: string,
  ): Promise<any>;
}
