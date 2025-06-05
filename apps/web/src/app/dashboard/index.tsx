import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/btn";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { getYoutubeVideoData } from "@/lib/apiClient";
import { requestHandler } from "@/lib/requestHandler";
import { useDebounce } from "@/lib/utils";
import { useAppSelector } from "@/store";
import {
    AlertCircleIcon,
    BoltIcon,
    BookOpenIcon,
    ChevronDownIcon,
    ImageUpIcon,
    Layers2Icon,
    LogOutIcon,
    MessageSquareCodeIcon,
    PinIcon,
    UserPenIcon,
    XIcon,
} from "lucide-react";
import React, { ChangeEvent, useId } from "react";
import { Link } from "react-router";

export default function DashboardPage() {
    const user = useAppSelector((state) => state.app.user);

    return (
        <div className="h-full">
            <div className="bg-neutral-900 pr-2 flex justify-between items-center h-12">
                <Link to="/">
                    <img
                        alt="Synapse"
                        src="/T&W@2x.png"
                        className="object-contain h-7"
                    />
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-auto p-0 hover:bg-none focus-visible:border-none focus-visible:ring-0"
                        >
                            <Avatar>
                                <AvatarImage
                                    src="./avatar.jpg"
                                    alt="Profile image"
                                />
                                <AvatarFallback>
                                    {user?.firstName[0]}
                                    {user?.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDownIcon
                                size={16}
                                className="opacity-60"
                                aria-hidden="true"
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-w-64 mr-3 mt-3">
                        <DropdownMenuLabel className="flex min-w-0 flex-col">
                            <span className="text-foreground truncate text-sm font-medium">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="text-muted-foreground truncate text-xs font-normal">
                                {user?.email}
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BoltIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Option 1</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Layers2Icon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Option 2</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <BookOpenIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Option 3</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <PinIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Option 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <UserPenIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Option 5</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <Link to="/user/logout">
                            <DropdownMenuItem>
                                <LogOutIcon
                                    size={16}
                                    className="opacity-60"
                                    aria-hidden="true"
                                />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="h-[35%] from-purple-400 to-red-500 via-pink-500 bg-gradient-to-r flex items-center gap-y-14 flex-col justify-center">
                <div>
                    <span className="text-6xl font-semibold">
                        Welcome back, {user?.firstName} {user?.lastName}
                    </span>
                </div>
                <div className="flex gap-x-4">
                    <Button
                        size="lg"
                        className="md:cursor-pointer h-10 px-10 text-md font-medium border-2 bg-white/20 text-white hover:bg-white/30"
                    >
                        Schedule a stream
                    </Button>
                    <GoLiveButton />
                </div>
            </div>
        </div>
    );
}

function GoLiveButton() {
    const titleInputId = useId();
    const videoUrlId = useId();
    const slowModeCheckInputId = useId();
    const aboutInputId = useId();
    const maxSize = 5 * 1024 * 1024; // max 5 mb
    const [
        { files, isDragging, errors },
        {
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            removeFile,
            getInputProps,
        },
    ] = useFileUpload({
        accept: "image/*",
        maxSize,
    });

    const debouncer = useDebounce();

    const [formData, setFormData] = React.useState<{
        videoUrl: string;
        title: string;
        about: string;
        slowChatMode: boolean;
        thumbnail: string | null;
    }>({
        videoUrl: "",
        title: "",
        about: "",
        slowChatMode: false,
        thumbnail: null,
    });

    const handleFetchVideoData = React.useCallback(
        async function (e: ChangeEvent<HTMLInputElement>) {
            console.log(formData);
            if (e.target.value.trim() == "") return;
            if (!e.target.value.trim().startsWith("https://")) return;
            setFormData((prev) => ({
                ...prev,
                videoUrl: prev.videoUrl.replace("https://", ""),
            }));
            await requestHandler(
                getYoutubeVideoData(e.target.value),
                undefined,
                (data) => {
                    setFormData((prev) => ({
                        ...prev,
                        thumbnail: data.data.thumbnail,
                        title: `${data.data.channelTitle} | ${data.data.title}`,
                        about: data.data.description,
                    }));
                },
                undefined,
                false
            );
        },
        [requestHandler, getYoutubeVideoData, setFormData, formData]
    );

    const previewUrl = files[0]?.preview || null;
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="md:cursor-pointer h-10 px-10 font-medium text-md"
                >
                    Go live now
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 overflow-y-visible max-w-5xl p-0 [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        Start stream
                    </DialogTitle>
                </DialogHeader>
                <div className="p-3 flex h-full gap-x-4">
                    <div className="w-2/3">
                        <div>
                            <Label htmlFor={videoUrlId}>
                                Video Url{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id={videoUrlId}
                                    className="peer ps-16"
                                    placeholder="youtube.com/watch?v="
                                    type="text"
                                    value={formData.videoUrl}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            videoUrl: e.target.value,
                                        }));
                                        debouncer(
                                            handleFetchVideoData.bind(null, e),
                                            1000
                                        );
                                    }}
                                />
                                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                                    https://
                                </span>
                            </div>
                        </div>
                        <div className="mt-2">
                            <Label htmlFor={titleInputId}>
                                Title{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id={titleInputId}
                                placeholder="Wonderful chatting"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                type="text"
                                required
                            />
                        </div>
                        <div className="flex justify-between py-2 mt-4">
                            <div>
                                <Label htmlFor={slowModeCheckInputId}>
                                    Chat slow mode{" "}
                                </Label>
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <Switch
                                    id={slowModeCheckInputId}
                                    checked={formData.slowChatMode}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            slowChatMode: checked,
                                        }))
                                    }
                                    aria-label="Toggle switch"
                                />
                                <Label
                                    htmlFor={slowModeCheckInputId}
                                    className="text-sm font-medium"
                                >
                                    {formData.slowChatMode ? "On" : "Off"}
                                </Label>
                            </div>
                        </div>
                        <div className="mt-2">
                            <Label htmlFor={aboutInputId}>About</Label>
                            <Textarea
                                value={formData.about}
                                id={aboutInputId}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        about: e.target.value,
                                    }))
                                }
                                placeholder="Having a good day."
                            />
                        </div>
                    </div>
                    <div className="w-1/3">
                        <Label>
                            Thumbnail upload{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <div
                                    role="button"
                                    onClick={openFileDialog}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    data-dragging={isDragging || undefined}
                                    className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
                                >
                                    <input
                                        {...getInputProps()}
                                        className="sr-only"
                                        aria-label="Upload file"
                                    />
                                    {formData.thumbnail || previewUrl ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={
                                                    formData.thumbnail ??
                                                    previewUrl ??
                                                    ""
                                                }
                                                alt={
                                                    files[0]?.file?.name ||
                                                    "Uploaded image"
                                                }
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                            <div
                                                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                                aria-hidden="true"
                                            >
                                                <ImageUpIcon className="size-4 opacity-60" />
                                            </div>
                                            <p className="mb-1.5 text-sm font-medium">
                                                Drop your image here or click to
                                                browse
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Max size: 5 MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {previewUrl && (
                                    <div className="absolute top-4 right-4">
                                        <button
                                            type="button"
                                            className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                            onClick={() =>
                                                removeFile(files[0]?.id)
                                            }
                                            aria-label="Remove image"
                                        >
                                            <XIcon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {errors.length > 0 && (
                                <div
                                    className="text-destructive flex items-center gap-1 text-xs"
                                    role="alert"
                                >
                                    <AlertCircleIcon className="size-3 shrink-0" />
                                    <span>{errors[0]}</span>
                                </div>
                            )}

                            <p
                                aria-live="polite"
                                role="region"
                                className="text-muted-foreground mt-2 text-center text-xs"
                            >
                                Upload your thumbnail here
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="border-t px-6 py-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button">
                            Start chat <MessageSquareCodeIcon />{" "}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
