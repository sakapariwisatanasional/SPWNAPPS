import React, { useState } from "react";
import {
  X,
  Tag,
  CheckCircle2,
  ShoppingBag,
  Share2
} from "lucide-react";

interface Props {
  item?: any;
  onClose?: () => void;
}

export const OfficialMerchandiseDetailModal_UIX_V4: React.FC<Props> = ({
  item,
  onClose
}) => {

  const [activeImage, setActiveImage] = useState(
    item?.image || item?.imageUrl || null
  );

  if (!item) return null;

  const productName = item?.name || "Official Merchandise";
  const images = Array.isArray(item?.gallery) && item.gallery.length
    ? item.gallery
    : [item?.image || item?.imageUrl].filter(Boolean);

  const displayImage = activeImage || images[0];

  return (
    <div className="
      fixed inset-0 z-[999]
      flex items-center justify-center
      bg-black/50
      p-4
    ">

      <div className="
        w-full
        max-w-6xl
        overflow-hidden
        rounded-[2rem]
        bg-white
        shadow-2xl
      ">

        <div className="
          flex items-center justify-between
          border-b
          px-6 py-5
        ">
          <div>
            <div className="
              text-xs
              font-bold
              tracking-widest
              text-emerald-700
            ">
              SPWN OFFICIAL STORE
            </div>

            <h2 className="
              text-2xl
              font-black
            ">
              Detail Merchandise
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-full
              bg-slate-100
              p-3
            "
          >
            <X size={22}/>
          </button>
        </div>


        <div className="
          grid
          lg:grid-cols-2
        ">

          <div className="
            bg-gradient-to-br
            from-emerald-950
            via-teal-700
            to-amber-500
            p-6
          ">

            <div className="
              flex
              h-[420px]
              items-center
              justify-center
              overflow-hidden
              rounded-3xl
              bg-white/10
            ">

              {displayImage ? (

                <img
                  src={displayImage}
                  alt={productName}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                  onError={(e)=>{
                    e.currentTarget.style.display="none";
                  }}
                />

              ) : (

                <ShoppingBag
                  size={100}
                  className="text-white"
                />

              )}

            </div>


            {images.length > 1 && (

              <div className="
                mt-4
                flex
                gap-3
              ">

                {images.map((img:string)=>(
                  <button
                    key={img}
                    onClick={()=>setActiveImage(img)}
                    className="
                      h-16
                      w-16
                      overflow-hidden
                      rounded-xl
                      border
                      bg-white
                    "
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}

              </div>

            )}

          </div>


          <div className="
            space-y-5
            p-8
          ">

            <div className="flex gap-2 flex-wrap">

              <span className="
                rounded-full
                bg-emerald-100
                px-3 py-1
                text-xs
                font-bold
                text-emerald-700
              ">
                Official
              </span>

              {item?.featured && (
                <span className="
                  rounded-full
                  bg-amber-100
                  px-3 py-1
                  text-xs
                  font-bold
                  text-amber-700
                ">
                  Featured
                </span>
              )}

            </div>


            <h1 className="
              text-4xl
              font-black
            ">
              {productName}
            </h1>


            <p className="
              text-lg
              text-slate-600
            ">
              {item?.description ||
              "Merchandise resmi Saka Pariwisata Nasional."}
            </p>


            <div className="
              text-3xl
              font-black
              text-orange-600
            ">
              Rp {Number(item?.price || 0)
              .toLocaleString("id-ID")}
            </div>


            {item?.material && (

              <div className="
                rounded-2xl
                bg-slate-50
                p-5
              ">
                <b>Material</b>
                <p className="text-slate-600">
                  {item.material}
                </p>
              </div>

            )}


            <div className="
              flex
              items-center
              gap-2
              text-slate-500
            ">
              <Tag size={16}/>
              {item?.category || "Merchandise"}
            </div>


            {item?.purchaseEnabled && (

              <div className="
                flex
                items-center
                gap-2
                font-bold
                text-green-600
              ">
                <CheckCircle2 size={18}/>
                Ready Stock
              </div>

            )}


            {item?.sizes?.length > 0 && (

              <div>
                <b>Pilihan Ukuran</b>

                <div className="
                  mt-2
                  flex
                  gap-2
                  flex-wrap
                ">
                  {item.sizes.map((size:string)=>(
                    <span
                      key={size}
                      className="
                        rounded-xl
                        border
                        px-4 py-2
                        font-bold
                      "
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

            )}


            <div className="
              flex
              gap-3
            ">

              <button className="
                flex-1
                rounded-2xl
                bg-emerald-700
                py-4
                font-black
                text-white
              ">
                Pesan Merchandise
              </button>


              <button className="
                rounded-2xl
                bg-slate-100
                px-5
              ">
                <Share2/>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OfficialMerchandiseDetailModal_UIX_V4;
