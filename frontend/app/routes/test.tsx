import type { Route } from "./+types/test";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Test" }];
}

export default function Test() {

    
  return (
      <>
          <nav className="left max">
              <a>
                  <i>menu</i>
              </a>
              
              <a>
                  <i>home</i>
                  <div>Pulpit</div>
              </a>
              <a>
                  <i>search</i>
                  <div>Tematy</div>
              </a>
              <a>
                  <i>more_vert</i>
                  <div>Mój profil</div>
              </a>
          </nav>
          <main className="responsive">
              <nav className="group split">
                  <button className="left-round">Button</button>
                  <button className="right-round">
                      <i>keyboard_arrow_down</i>
                  </button>
              </nav>
          </main>
      </>
  );
}
