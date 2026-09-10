"use client";

import Link from "next/link";

const roles = [
  {
    title: "Customer",
    subtitle: "Sell scrap & manage pickups",
    description:
      "Sell recyclable materials, request doorstep waste collection and track your pickups.",
    icon: "👤",
    href: "/customer",
    button: "Enter Customer Portal",
    color:
      "border-green-200 hover:border-green-500 hover:bg-green-50",
  },
  {
    title: "Kabadiwala",
    subtitle: "Manage collection requests",
    description:
      "View nearby customer requests, accept pickups and manage collections.",
    icon: "🚚",
    href: "/kabadiwala",
    button: "Enter Partner Portal",
    color:
      "border-blue-200 hover:border-blue-500 hover:bg-blue-50",
  },
  {
    title: "Recycler",
    subtitle: "Manage recyclable materials",
    description:
      "View available materials, requirements and purchase requests.",
    icon: "♻️",
    href: "/recycler",
    button: "Enter Recycler Portal",
    color:
      "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* NAVBAR */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl text-white">
              ♻
            </div>

            <div>

              <h1 className="text-lg font-bold">
                Scrap
                <span className="text-green-600">
                  Saathi
                </span>
              </h1>

              <p className="text-[10px] text-slate-500">
                Smart Waste. Better Future.
              </p>

            </div>

          </Link>


          <Link
            href="/customer"
            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
          >
            Get Started
          </Link>

        </div>

      </header>


      {/* HERO */}

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16">

        <div className="mx-auto max-w-3xl text-center">

          <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
            ♻️ SMART WASTE COLLECTION PLATFORM
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Sell. Collect.
            <span className="text-green-600">
              {" "}
              Recycle.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
            ScrapSaathi connects customers,
            local collection partners and
            recyclers in one simple platform.
          </p>

        </div>


        {/* ROLE SELECTION */}

        <div className="mt-14">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-wider text-green-600">
              CHOOSE YOUR PORTAL
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              Who are you?
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select the portal you want to use.
            </p>

          </div>


          <div className="mt-7 grid gap-5 lg:grid-cols-3">

            {roles.map((role) => (

              <Link
                key={role.title}
                href={role.href}
                className={`group rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${role.color}`}
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                    {role.icon}
                  </div>

                  <span className="text-2xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-600">
                    →
                  </span>

                </div>


                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {role.subtitle}
                </p>

                <h4 className="mt-2 text-2xl font-bold">
                  {role.title}
                </h4>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
                  {role.description}
                </p>


                <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-700 transition group-hover:bg-green-600 group-hover:text-white">
                  {role.button} →
                </div>

              </Link>

            ))}

          </div>

        </div>


        {/* HOW IT WORKS */}

        <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-7 md:p-9">

          <div className="text-center">

            <p className="text-xs font-bold text-green-600">
              HOW SCRAPSAATHI WORKS
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              From waste to the right destination.
            </h3>

          </div>


          <div className="mt-8 grid gap-6 md:grid-cols-4">

            <Step
              number="01"
              icon="📷"
              title="Request"
              text="Customer adds material and pickup details."
            />

            <Step
              number="02"
              icon="📍"
              title="Match"
              text="Nearby collection partners can view the request."
            />

            <Step
              number="03"
              icon="🚚"
              title="Collect"
              text="Partner accepts the pickup and collects the waste."
            />

            <Step
              number="04"
              icon="♻️"
              title="Recycle"
              text="Recyclable material can move toward the recycling ecosystem."
            />

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row">

          <p>
            © 2026 ScrapSaathi
          </p>

          <p>
            Smart Waste. Better Future.
          </p>

        </div>

      </footer>

    </main>
  );
}


/* =====================================================
   STEP
===================================================== */

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-bold text-green-600">
        STEP {number}
      </p>

      <h4 className="mt-1 font-bold">
        {title}
      </h4>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}