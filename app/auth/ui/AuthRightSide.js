import Image from 'next/image'
import React from 'react'

export default function AuthRightSide() {
  return (
    <section className="flex-1 lg:flex flex-col hidden  p-3">
      {/* <div className="flex-1 border border-red-500 bg-cover bg-center bg-[url('/auth_bg_image.png.jpg')]">
        <Image
          src="/auth_bg_image.png.jpg"
          alt="Group of diverse students studying together in a library."
          width={2000}
          height={2000}
          className="h-[386px] w-full object-fill -scale-x-100 rounded-t-4xl"
        />
      </div> */}
      <div className='h-[386px] rounded-t-[20px] bg-cover bg-center bg-[url("/auth_bg_image.png.jpg")]'>

      </div>
      <div
        className="bg-[#1A3A3A] flex-3 rounded-b-[20px] flex items-end justify-start"
        // style={{
        //   background: `url("/Vector.svg")`,
        //   backgroundSize: "auto",
        //   backgroundRepeat: "no-repeat",
        //   backgroundPosition: "center",
        // }}
      >
        <div className="p-16 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-6 z-10">
            <Image
              src="/indicator.svg"
              alt="indicator.svg"
              width={50}
              height={50}
              className="h-auto w-auto"
            />
          </div>
          <h2 className="text-[48px] font-bold leading-tight mb-4 z-10">
            Learning Insights <br /> Tailored for You
          </h2>
          <p className="text-[#E8EBE6] max-w-md z-10">
            Gain personalized recommendations and progress updates based on your
            learning goals. SMRI helps you stay on track and make your study
            sessions more effective.
          </p>
        </div>
      </div>
    </section>
  );
}
