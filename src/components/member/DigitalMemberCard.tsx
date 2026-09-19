
    
  
import React from "react";
import { QrCode, ShieldCheck } from "lucide-react";

interface DigitalMemberCardProps {
  member?: any;
  currentUser?: any;
  [key: string]: any;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  currentUser
}) => {
  const data = member || currentUser || {};

  const name =
    data.name ||
    data.fullName ||
    "Anggota Saka Pariwisata";

  const memberNumber =
    data.memberNumber ||
    data.ktaNumber ||
    data.nia ||
    "SPWN-000000";

  const krida =
    data.krida ||
    data.kridaName ||
    "Saka Pariwisata";

  const photo =
    data.photo ||
    data.avatar ||
    "";

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        p-6
        md:p-8
        min-h-[230px]
        text-white
        bg-gradient-to-br
        from-red-600
        via-amber-400
        to-teal-500
        shadow-xl
      "
    >

      <div className="
        absolute
        -right-10
        -top-10
        w-48 h-48
        rounded-full
        bg-white/20
      "/>

      <div className="
        relative
        flex
        justify-between
        gap-5
      ">

        <div className="flex-1">

          <div className="
            flex
            items-center
            gap-2
            text-sm
            font-bold
            opacity-90
          ">
            🇮🇩 SAKA PARIWISATA
          </div>


          <div className="
            mt-8
            flex
            items-center
            gap-4
          ">

            {photo ? (
              <img
                src={photo}
                alt={name}
                className="

