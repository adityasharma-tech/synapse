import { useCallback } from "react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const chats = [
    {
      "name": "Charlie Davis",
      "message": "Loving the premium chat! Worth every penny. 💎",
      "upvotes": 50,
      "downvotes": 2,
      "premium": true,
      "payment_amount": 9.99
    },
    {
      "name": "Ethan Clark",
      "message": "Just subscribed to premium, and it's amazing! 🔥",
      "upvotes": 40,
      "downvotes": 0,
      "premium": true,
      "payment_amount": 4.99
    },
    {
      "name": "Alice Johnson",
      "message": "This chat app is super fast and smooth! 🚀",
      "upvotes": 25,
      "downvotes": 3,
      "premium": false
    },
    {
      "name": "Bob Williams",
      "message": "How do I enable dark mode? 🌙",
      "upvotes": 10,
      "downvotes": 1,
      "premium": false
    },
    {
      "name": "Diana Ross",
      "message": "This app needs more emojis! 😆",
      "upvotes": 15,
      "downvotes": 5,
      "premium": false
    },
  ]

  const handleToogleDarkMode = useCallback(()=>{
    const root = window.document.querySelector('body')
    if(!root) return;
    if(root.classList.contains('dark')) root.classList.remove('dark')
      else root.classList.add('dark');
  },[])
  
  return (
    <div className="overflow-y-scroll h-screen">
      <header className="justify-between w-full flex py-5 px-6 items-center">
        <div>
          <img className="h-8 w-auto dark:hidden" src="/T&B@2x.png" />
          <img
            className="h-8 w-auto not-dark:hidden"
            src="/T&W@2x.png"
          />
        </div>
        <div className="flex gap-x-3">
          <button className="button btn-ghost">Product</button>
          <button className="button btn-ghost">Solutions</button>
          <button className="button btn-ghost">Pricing</button>
          <button className="button btn-ghost">Privacy Policy</button>
        </div>
        <div className="flex gap-x-3">
          <button onClick={handleToogleDarkMode} className="button mr-4 group hover:bg-neutral-800 px-2.5 rounded-full">
            <svg width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="none">
              <path
                d="M7.285 10.333a5 5 0 103.049-3.049M12 2v2M12 20v2M4 12H2M22 12h-2M19.778 4.223l-2.222 2.031M4.222 4.223l2.222 2.031M6.444 17.556l-2.222 2.222M19.778 19.777l-2.222-2.222"
                className="dark:stroke-neutral-50 stroke-neutral-900 group-hover:stroke-neutral-50"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button onClick={()=>navigate('/auth/login')} className="button btn-outline">Log in</button>
          <button onClick={()=>navigate('/auth/signup')} className="button btn-solid">Sign up</button>
        </div>
      </header>
      <main>
        <section
          id="hero"
          className="grid grid-cols-2 h-[70vh] px-20 py-24 mb-10"
        >
          <div className="h-full">
            <div className="text-6xl flex flex-col gap-y-4">
              <span>Instant, Smart,</span>
              <span>
                and <span style={{ color: "#DD7373" }}>secure</span>
              </span>
              <span>Premium Chats</span>
              {/* Instant, Interactive, and Secure Premium Chats */}
            </div>
            <div className="py-10">
              <p className="max-w-sm">
                Chat effortlessly, connect globally, share ideas, build
                communities, and grow together.
              </p>
            </div>
            <div className="flex gap-x-5 mt-8">
              <button onClick={()=>navigate('/dashboard')} className="button btn-solid h-12 relative group">
                <svg
                  width="1.3em"
                  height="1.3em"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 9h8M8 12.5h5.5"
                    className="stroke-neutral-50 dark:stroke-neutral-900"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.087 21.388l.645.382-.645-.382zm.542-.916l-.646-.382.646.382zm-3.258 0l-.645.382.645-.382zm.542.916l.646-.382-.646.382zM1.25 10.5a.75.75 0 001.5 0h-1.5zm1.824 5.126a.75.75 0 00-1.386.574l1.386-.574zm4.716 3.365l-.013.75.013-.75zm-2.703-.372l-.287.693.287-.693zm16.532-2.706l.693.287-.693-.287zm-5.409 3.078l-.012-.75.012.75zm2.703-.372l.287.693-.287-.693zm.7-15.882l-.392.64.392-.64zm1.65 1.65l.64-.391-.64.392zM4.388 2.738l-.392-.64.392.64zm-1.651 1.65l-.64-.391.64.392zM9.403 19.21l.377-.649-.377.649zm4.33 2.56l.541-.916-1.29-.764-.543.916 1.291.764zm-4.007-.916l.542.916 1.29-.764-.541-.916-1.291.764zm2.715.152a.52.52 0 01-.882 0l-1.291.764c.773 1.307 2.69 1.307 3.464 0l-1.29-.764zM10.5 2.75h3v-1.5h-3v1.5zm10.75 7.75v1h1.5v-1h-1.5zM7.803 18.242c-1.256-.022-1.914-.102-2.43-.316L4.8 19.313c.805.334 1.721.408 2.977.43l.026-1.5zM1.688 16.2A5.75 5.75 0 004.8 19.312l.574-1.386a4.25 4.25 0 01-2.3-2.3l-1.386.574zm19.562-4.7c0 1.175 0 2.019-.046 2.685-.045.659-.131 1.089-.277 1.441l1.385.574c.235-.566.338-1.178.389-1.913.05-.729.049-1.632.049-2.787h-1.5zm-5.027 8.241c1.256-.021 2.172-.095 2.977-.429l-.574-1.386c-.515.214-1.173.294-2.428.316l.025 1.5zm4.704-4.115a4.25 4.25 0 01-2.3 2.3l.573 1.386a5.75 5.75 0 003.112-3.112l-1.386-.574zM13.5 2.75c1.651 0 2.837 0 3.762.089.914.087 1.495.253 1.959.537l.783-1.279c-.739-.452-1.577-.654-2.6-.752-1.012-.096-2.282-.095-3.904-.095v1.5zm9.25 7.75c0-1.622 0-2.891-.096-3.904-.097-1.023-.299-1.862-.751-2.6l-1.28.783c.285.464.451 1.045.538 1.96.088.924.089 2.11.089 3.761h1.5zm-3.53-7.124a4.25 4.25 0 011.404 1.403l1.279-.783a5.75 5.75 0 00-1.899-1.899l-.783 1.28zM10.5 1.25c-1.622 0-2.891 0-3.904.095-1.023.098-1.862.3-2.6.752l.783 1.28c.464-.285 1.045-.451 1.96-.538.924-.088 2.11-.089 3.761-.089v-1.5zM2.75 10.5c0-1.651 0-2.837.089-3.762.087-.914.253-1.495.537-1.959l-1.279-.783c-.452.738-.654 1.577-.752 2.6C1.25 7.61 1.25 8.878 1.25 10.5h1.5zm1.246-8.403a5.75 5.75 0 00-1.899 1.899l1.28.783a4.25 4.25 0 011.402-1.403l-.783-1.279zm7.02 17.993c-.202-.343-.38-.646-.554-.884a2.229 2.229 0 00-.682-.645l-.754 1.297c.047.028.112.078.224.232.121.166.258.396.476.764l1.29-.764zm-3.24-.349c.44.008.718.014.93.037.198.022.275.054.32.08l.754-1.297c-.293-.17-.598-.24-.909-.274-.298-.033-.657-.038-1.069-.045l-.025 1.5zm6.498 1.113c.218-.367.355-.598.476-.764.112-.154.177-.204.224-.232l-.754-1.297c-.29.17-.5.395-.682.645-.173.238-.352.54-.555.884l1.291.764zm1.924-2.612c-.412.007-.771.012-1.069.045-.311.035-.616.104-.909.274l.754 1.297c.045-.026.122-.058.32-.08.212-.023.49-.03.93-.037l-.026-1.5z"
                    className="fill-neutral-50 dark:fill-neutral-900"
                  />
                </svg>
                Create stream
                <span className="absolute bg-black/10 inset-0 translate-1 group-hover:translate-0.5 rounded-lg -z-5 dark:bg-neutral-100/10" />
              </button>
              <div className="flex gap-x-4 items-center">
                <button
                  style={{
                    backgroundColor: "#249780",
                    border: "none",
                    paddingRight: "20px",
                    paddingLeft: "20px",
                  }}
                  className="button btn-solid h-12 relative group "
                >
                  <svg width="1em" height="1em" viewBox="-0.5 0 7 7">
                    <path
                      d="M5.495 2.573L1.5.143C.832-.266 0 .25 0 1.068V5.93c0 .82.832 1.333 1.5.927l3.995-2.43c.673-.41.673-1.445 0-1.855"
                      fill="#fefefe"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="absolute bg-black/10 inset-0 translate-1 group-hover:translate-0.5 rounded-lg -z-5 dark:bg-neutral-100/10" />
                </button>
                <span>Watch video</span>
              </div>
            </div>
          </div>
          <div className="h-full">
            {chats.map((chat, idx) => (
              <div
                key={idx}
                data-premium={chat.premium}
                className="px-3 py-3 first:mt-0 mt-3 bg-neutral-100 dark:bg-[#222] rounded-xl data-[premium=true]:border data-[premium=true]:border-amber-300 data-[premium=true]:bg-amber-50 dark:data-[premium=true]:border-amber-300 dark:data-[premium=true]:bg-amber-300/5"
              >
                <div className="flex w-full justify-between">
                  <div className="flex gap-x-3 items-center dark:text-neutral-50 text-neutral-800 font-medium">
                    <img
                      className="size-8 rounded-full"
                      src={`https://avatar.iran.liara.run/public?id=${idx}`}
                    />
                    <span className="font-medium">{chat.name}</span>
                    {chat.payment_amount ? (
                      <span className="font-semibold text-emerald-600">
                        ${chat.payment_amount}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-x-3 items-center">
                    <button className="button border text-sm pl-2 text-green-600 bg-green-50 active:ring-green-400 ring-transparent px-1 py-0.5 rounded-md border-green-600 ring">
                      <span>{chat.upvotes}</span>
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M11.272 5.205l5 8A1.5 1.5 0 0115 15.5H5a1.5 1.5 0 01-1.272-2.295l5-8a1.5 1.5 0 012.544 0z"
                          className="fill-green-600"
                        />
                      </svg>
                    </button>

                    <button className="button border text-sm pl-2 text-amber-600 bg-amber-50 active:ring-amber-400 ring-transparent px-1 py-0.5 rounded-md border-amber-600 ring">
                      <span>{chat.downvotes}</span>
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="rotate-180"
                      >
                        <path
                          d="M11.272 5.205l5 8A1.5 1.5 0 0115 15.5H5a1.5 1.5 0 01-1.272-2.295l5-8a1.5 1.5 0 012.544 0z"
                          className="fill-amber-600"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <span className="text-neutral-800 text-[15px] dark:text-neutral-50 antialiased">
                    {chat.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="w-full py-36 flex justify-center gap-x-14 items-center bg-neutral-100 dark:bg-[#222]">
          <div className="flex flex-col justify-start">
            <span className="text-4xl">
              Ready to setup <br />
              your next conference
            </span>
            <button className="button btn-ghost underline-offset-4 mt-5 underline hover:text-cyan-600">
              Learn more
            </button>
          </div>
          <div className="h-40 border border-neutral-200" />
          <div className="max-w-xl text-sm text-neutral-600">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Unde
            molestias tempore voluptatem, deserunt debitis doloribus porro
            placeat nesciunt obcaecati cum reiciendis maiores et explicabo culpa
            repellendus? Iure pariatur soluta doloremque, fugiat praesentium aut
            atque qui, reprehenderit optio minima quis! Distinctio!
          </div>
        </div>
      </main>
    </div>
  );
}
