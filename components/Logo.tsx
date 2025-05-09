import CustomIcon from "@/components/CustomIcon";
import Link from "next/link";

export default function Logo({ isMobile = false }) {
  console.log("isMobile", isMobile);
  return (
    <>
      <Link href="/" className="flex gap-3 items-center">
        <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-foreground p-1">
          <CustomIcon fileName="logo" classes="size-8 bg-background" />
        </div>
        {!isMobile && (
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-lg uppercase">
              Orders
            </span>
          </div>
        )}
      </Link>
    </>
  );
}
