type CustomIconPropsType = {
  classes: string;
  fileName: string;
};
export default function CustomIcon({
  classes = "",
  fileName,
}: CustomIconPropsType) {
  return (
    <div
      aria-hidden={true}
      className={`${classes}`}
      style={{
        WebkitMaskImage: `url(/assets/${fileName}.svg)`,
        maskImage: `url(/assets/${fileName}.svg)`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
