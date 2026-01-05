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
      <div className='h-[386px] rounded-t-[20px] bg-cover bg-center bg-[url("/auth_bg_image.png")]'>

      </div>
      <div
        className="bg-[#1A3A3A] flex-3 rounded-b-[20px] flex items-start justify-start"
        // style={{
        //   background: `url("/Vector.svg")`,
        //   backgroundSize: "auto",
        //   backgroundRepeat: "no-repeat",
        //   backgroundPosition: "center",
        // }}
      >
        <div className="p-16 flex flex-col justify-center text-white relative overflow-hidden">
       
          <h2 className="text-[54px] font-medium leading-tight mb-4 z-10">
              Social Media First Aid
          </h2>
          <p className="text-[#E8EBE6] text-[30px] max-w-md z-10">
          
Awareness, balance, and healthier digital habits
          </p>
        </div>
      </div>
    </section>
  );
}
