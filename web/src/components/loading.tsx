export default function LoadingComp() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col gap-y-5">
        <span className="text-2xl">Loading...</span>
        <div className="flex gap-x-3 justify-center">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </div>
    </div>
  )
}
