type Data = Record<string, unknown>;

export default import.meta.env.PROD
    ? // @ts-expect-error This is injected by index.html, from a remote script
      window["gtag"]
    : (() => {
          let data: Data = {};

          return function GTag(cmd: string, p: string | Data, v: unknown) {
              if (cmd === "set") {
                  if (typeof p === "string") {
                      data[p] = v;
                  } else {
                      data = {
                          ...data,
                          ...p,
                      };
                  }
              } else if (cmd === "event") {
                  // eslint-disable-next-line no-console
                  console.log("GA", p, data.page_path, data);
              }
          };
      })();
