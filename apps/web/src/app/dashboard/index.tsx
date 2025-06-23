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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
    createNewPlan,
    deleteEmoteByCode,
    fetchPaymentPlanDetails,
    getAllStreams,
    getEmoteByStreamerId,
    getYoutubeVideoData,
    startNewStream,
    uploadCustomEmotes,
} from "@/lib/apiClient";
import { requestHandler } from "@/lib/requestHandler";
import { useDebounce } from "@/lib/utils";
import { useAppSelector } from "@/store";
import {
    AlertCircleIcon,
    BadgeDollarSign,
    BoltIcon,
    ChevronDownIcon,
    ImageUpIcon,
    IndianRupee,
    Layers2Icon,
    LoaderCircle,
    LogOutIcon,
    MessageSquareCodeIcon,
    Reply,
    SmileIcon,
    UserPenIcon,
    XIcon,
    ImageIcon,
    UploadIcon,
    ListTodo,
} from "lucide-react";
import React, {
    ChangeEvent,
    ChangeEventHandler,
    FormEvent,
    MouseEventHandler,
    useCallback,
    useId,
    useState,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function DashboardPage() {
    const user = useAppSelector((state) => state.app.user);

    const [streamFetchLoading, setStreamFetchLoading] = React.useState(true);
    const [previousStreams, setPreviousStreams] = React.useState<any[]>([]);
    const [subscriptionDialogOpen, setSubscriptionDialogOpen] =
        React.useState<boolean>(false);
    const [customEmojiDialogOpen, setCustomEmojiDialogOpen] =
        useState<boolean>(false);

    const handleFetchStreams = React.useCallback(async () => {
        await requestHandler(
            getAllStreams(),
            setStreamFetchLoading,
            (result) => {
                setPreviousStreams(result.data.data);
            },
            () => {
                setPreviousStreams([]);
            }
        );
    }, [requestHandler, getAllStreams, setPreviousStreams]);

    React.useEffect(() => {
        handleFetchStreams();
    }, []);

    return (
        <div className="h-full">
            <SubscriptionsModel
                isModelOopen={subscriptionDialogOpen}
                setModelOpen={setSubscriptionDialogOpen}
            />
            <CustomEmojiModal
                isModelOpen={customEmojiDialogOpen}
                setModelOpen={setCustomEmojiDialogOpen}
            />

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
                            {user && user.role == "admin" ? (
                                <Link to="streamer-applications">
                                    <DropdownMenuItem>
                                        <ListTodo
                                            size={16}
                                            className="opacity-60"
                                            aria-hidden="true"
                                        />
                                        <span>Applications</span>
                                    </DropdownMenuItem>{" "}
                                </Link>
                            ) : null}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <button
                                className="w-full"
                                onClick={() => setSubscriptionDialogOpen(true)}
                            >
                                <DropdownMenuItem>
                                    <BadgeDollarSign
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                    />
                                    <span>Subscriptions</span>
                                </DropdownMenuItem>
                            </button>
                            <button
                                className="w-full"
                                onClick={() => setCustomEmojiDialogOpen(true)}
                            >
                                <DropdownMenuItem>
                                    <SmileIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                    />
                                    <span>Custom emotes</span>
                                </DropdownMenuItem>
                            </button>
                            {user?.role != "streamer" ? (
                                <Link to="/dashboard/apply">
                                    <DropdownMenuItem>
                                        <UserPenIcon
                                            size={16}
                                            className="opacity-60"
                                            aria-hidden="true"
                                        />
                                        <span>Apply for streamer</span>
                                    </DropdownMenuItem>
                                </Link>
                            ) : null}
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
            <div className="flex md:flex-row flex-col md:h-[calc(100vh-(35%+48px))]">
                <div className="h-full md:w-2/5 p-3 flex flex-col">
                    <div>
                        <span>Notifications</span>
                    </div>
                    <div className="flex h-full flex-col overflow-y-auto gap-y-2 pt-2">
                        <NotificationModel />
                        <NotificationModel />
                        <NotificationModel />
                        <NotificationModel />
                    </div>
                </div>
                <div className="h-full md:w-3/5 p-3 flex flex-col">
                    <div>
                        <span>Watch history</span>
                    </div>
                    <div className="relative grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 gap-3 h-full overflow-y-auto">
                        {streamFetchLoading ? (
                            Array(5)
                                .fill(null)
                                .map((_, i) => <VideoSkeleton key={i} />)
                        ) : previousStreams.length <= 0 ? (
                            <div className="text-neutral-600 absolute top-1/2 left-1/2 -translate-1/2">
                                No steam found.
                            </div>
                        ) : (
                            previousStreams.map((stream) => (
                                <VideoModel key={stream.id} {...stream} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VideoSkeleton() {
    return (
        <div className="flex flex-col p-3 gap-y-3">
            <Skeleton className="h-[50%]" />
            <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-[90%]" />
                    <Skeleton className="h-3 w-[60%]" />
                </div>
            </div>
        </div>
    );
}

interface SingleCustomEmojiPreviewPropT {
    id: string;
    imageUrl: string;
    name: string;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

function SingleCustomEmojiPreview({
    imageUrl,
    id,
    name,
    onDelete,
    isDeleting,
}: SingleCustomEmojiPreviewPropT) {
    return (
        <div
            aria-busy={isDeleting}
            className="p-2 aria-busy:opacity-70 rounded border group border-neutral-700 bg-neutral-800/50 relative flex items-center gap-x-2"
        >
            <button
                disabled={isDeleting}
                onClick={() => onDelete(id)}
                type="button"
                className="absolute group-hover:block hidden -top-2 -right-2 rounded-full border border-neutral-600 bg-neutral-900 p-0.5"
            >
                <XIcon className="size-3.5" />
            </button>
            <div>
                <img className="size-5" src={imageUrl} alt={id} />
            </div>
            <div>
                <span
                    style={{
                        fontFamily: "Poppins",
                    }}
                    className="text-sm font-medium text-neutral-200"
                >
                    {name}
                </span>
            </div>
        </div>
    );
}

function CustomEmojiModal({
    isModelOpen,
    setModelOpen,
}: {
    isModelOpen: boolean;
    setModelOpen: (val: boolean) => void;
}) {
    const maxSizeMB = 1;
    const maxSize = maxSizeMB * 1024 * 1024;

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
        accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
        maxSize,
    });

    const previewUrl = files[0]?.preview || null;
    // const fileName = files[0]?.file.name || null;
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [_, setFetching] = useState(true);
    const [deletingEmoteId, setDeleting] = useState<string | null>(null);

    const [emotes, setEmotes] = useState<
        {
            code: string;
            name: string;
            imageUrl: string;
        }[]
    >([]);

    const emoteNameInputId = useId();
    const user = useAppSelector((state) => state.app.user);

    const handleFetchEmotes = useCallback(async () => {
        if (user)
            await requestHandler(
                getEmoteByStreamerId({ streamerId: user.id }),
                setFetching,
                ({ data }) => {
                    setEmotes(data);
                },
                undefined,
                false
            );
    }, [user, requestHandler, getEmoteByStreamerId, setFetching, setEmotes]);

    const handleDeleteEmoteByCode = useCallback(
        async (id: string) => {
            setDeleting(id);
            await requestHandler(
                deleteEmoteByCode({ code: id }),
                undefined,
                () => {
                    handleFetchEmotes();
                },
                undefined,
                false
            );
            setDeleting(null);
        },
        [setDeleting, requestHandler, deleteEmoteByCode, handleFetchEmotes]
    );

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();

            if (!(files[0].file instanceof File))
                return toast.error("Please select any file.");

            const formData = new FormData();
            console.log(files[0].file);
            formData.set("emoji", files[0].file);
            formData.set("name", name);
            formData.set("code", code);

            await requestHandler(
                uploadCustomEmotes(formData),
                setLoading,
                () => {
                    setName("");
                    setCode("");
                    removeFile(files[0].id);
                    handleFetchEmotes();
                },
                undefined,
                false
            );
        },
        [
            files,
            name,
            code,
            requestHandler,
            uploadCustomEmotes,
            setLoading,
            toast,
            setName,
            setCode,
            removeFile,
            handleFetchEmotes,
        ]
    );

    React.useEffect(() => {
        handleFetchEmotes();
    }, [user]);

    return (
        <Dialog open={isModelOpen} onOpenChange={setModelOpen}>
            <DialogContent className="overflow-y-visible max-w-5xl p-0">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        Subscriber emotes
                    </DialogTitle>
                </DialogHeader>
                <div className="h-[70vh] px-5 flex-col overflow-auto">
                    <div className="mb-2 text-sm text-neutral-400 font-medium">
                        Upload new emote
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full gap-x-3"
                    >
                        <div className="flex w-2/5 flex-col gap-2">
                            <div className="relative">
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    data-dragging={isDragging || undefined}
                                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                                >
                                    <input
                                        {...getInputProps()}
                                        className="sr-only"
                                        aria-label="Upload image file"
                                    />
                                    {previewUrl ? (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <img
                                                src={previewUrl}
                                                alt={
                                                    files[0]?.file?.name ||
                                                    "Uploaded image"
                                                }
                                                className="mx-auto max-h-full rounded object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                            <div
                                                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                                aria-hidden="true"
                                            >
                                                <ImageIcon className="size-4 opacity-60" />
                                            </div>
                                            <p className="mb-1.5 text-sm font-medium">
                                                Drop your image here
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                SVG, PNG, JPG or GIF (max.{" "}
                                                {maxSizeMB}MB)
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-4"
                                                onClick={openFileDialog}
                                            >
                                                <UploadIcon
                                                    className="-ms-1 size-4 opacity-60"
                                                    aria-hidden="true"
                                                />
                                                Select image
                                            </Button>
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
                        </div>
                        <div className="flex w-3/5 justify-between flex-col gap-y-5">
                            <div>
                                <div className="*:not-first:mt-2">
                                    <Label htmlFor={emoteNameInputId}>
                                        Emote name
                                    </Label>
                                    <Input
                                        id={emoteNameInputId}
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                        }}
                                        placeholder="Weird laugh"
                                        type="text"
                                        required
                                        name="emote-name"
                                    />
                                </div>
                                <div className="mt-2">
                                    <Label>Emote id</Label>
                                    <Input
                                        value={code}
                                        onChange={(e) =>
                                            setCode(
                                                e.target.value
                                                    .toLowerCase()
                                                    .trim()
                                                    .replace(" ", "")
                                            )
                                        }
                                        placeholder="smiling"
                                        type="text"
                                        required
                                        name="emote-id"
                                    />
                                    <p
                                        className="text-muted-foreground mt-2 text-xs"
                                        role="region"
                                        aria-live="polite"
                                    >
                                        Will generate code for emote like
                                        :username_emoteid:
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    disabled={loading}
                                    data-loading={loading}
                                    className="data-[loading=false]:px-10"
                                >
                                    <LoaderCircle
                                        aria-hidden={!loading}
                                        className="size-4 aria-hidden:hidden animate-spin"
                                    />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </form>
                    <div className="w-full h-px bg-neutral-800 my-5" />
                    <div className="grid grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-4 pb-5">
                        {emotes.map((emote) => (
                            <SingleCustomEmojiPreview
                                key={emote.code}
                                id={emote.code}
                                imageUrl={emote.imageUrl}
                                name={emote.name}
                                onDelete={handleDeleteEmoteByCode}
                                isDeleting={emote.code == deletingEmoteId}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SubscriptionsModel({
    isModelOopen,
    setModelOpen,
}: {
    isModelOopen: boolean;
    setModelOpen: (val: boolean) => void;
}) {
    const planNameInputID = useId();
    const amountInputId = useId();
    const aboutInputId = useId();
    const user = useAppSelector((state) => state.app.user);

    const [loading, setLoading] = useState<boolean>(false);
    const [_, setFetching] = useState<boolean>(true);
    const [planCreated, setPlanCreated] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        planName: string;
        inrAmountPerMonth: number;
        planDetails: string;
    }>({
        inrAmountPerMonth: 10,
        planDetails: "",
        planName: "",
    });

    const handleChange: ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement
    > = (e) => {
        e.preventDefault();
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            await requestHandler(
                createNewPlan({
                    ...formData,
                    inrAmountPerMonth: Number(formData.inrAmountPerMonth),
                }),
                setLoading,
                () => {
                    setPlanCreated(true);
                    setModelOpen(false);
                }
            );
        },
        [
            requestHandler,
            createNewPlan,
            formData,
            setLoading,
            setPlanCreated,
            setModelOpen,
        ]
    );

    const handleRequestPlanDetails = useCallback(async () => {
        if (user)
            await requestHandler(
                fetchPaymentPlanDetails({ streamerId: user.id }),
                setFetching,
                (data) => {
                    setFormData({
                        inrAmountPerMonth: data.data.plan.planAmount,
                        planDetails: data.data.plan.planDetails,
                        planName: data.data.plan.planName,
                    });
                    setPlanCreated(true);
                },
                undefined,
                false
            );
    }, [
        requestHandler,
        fetchPaymentPlanDetails,
        user,
        setFetching,
        setFormData,
        setPlanCreated,
    ]);

    React.useEffect(() => {
        handleRequestPlanDetails();
    }, []);

    return (
        <Dialog open={isModelOopen} onOpenChange={setModelOpen}>
            <DialogContent className="overflow-y-visible max-w-xl p-0">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-0 [&>button:last-child]:top-3.5"
                >
                    <DialogHeader className="contents space-y-0 text-left">
                        <DialogTitle className="border-b px-6 py-4 text-base">
                            Your channel plans
                        </DialogTitle>
                    </DialogHeader>
                    {!planCreated ? (
                        <div className="p-3 flex h-full flex-col">
                            <div className="*:not-first:mt-2">
                                <Label htmlFor={planNameInputID}>
                                    Plan name{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={planNameInputID}
                                    placeholder="Diamond"
                                    type="text"
                                    required
                                    name="planName"
                                    onChange={handleChange}
                                    value={formData.planName}
                                />
                            </div>
                            <div className="mt-2 max-w-xs">
                                <Label htmlFor={amountInputId}>
                                    Amount per month
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        id={amountInputId}
                                        className="peer ps-8 pe-12"
                                        placeholder="0.00"
                                        type="number"
                                        required
                                        onChange={handleChange}
                                        value={formData.inrAmountPerMonth}
                                        name="inrAmountPerMonth"
                                    />
                                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                                        <IndianRupee className="size-3.5" />
                                    </span>
                                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
                                        INR
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2">
                                <Label htmlFor={aboutInputId}>
                                    Plan details{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    value={formData.planDetails}
                                    id={aboutInputId}
                                    onChange={handleChange}
                                    name="planDetails"
                                    placeholder="Your channel name (Aditya Sharma) and member status may be publicly visible and shared by the channel with third parties (to provide perks)."
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 flex h-full flex-col">
                            <div className="flex justify-between items-center">
                                <span>{formData.planName}</span>
                                <div className="flex items-center gap-x-2">
                                    <span className="font-medium">
                                        ₹{formData.inrAmountPerMonth}/month
                                    </span>
                                    <Button
                                        disabled
                                        type="button"
                                        size={"sm"}
                                        className="rounded-full"
                                    >
                                        Subscribe
                                    </Button>
                                </div>
                            </div>
                            <div className="text-sm font-medium py-3 text-neutral-500">
                                {formData.planDetails}
                            </div>
                        </div>
                    )}
                    {planCreated ? null : (
                        <DialogFooter className="border-t px-6 py-4">
                            <DialogClose asChild>
                                <Button
                                    disabled={loading}
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button disabled={loading} type="submit">
                                Create plan{" "}
                                {loading && (
                                    <LoaderCircle className="animate-spin" />
                                )}
                            </Button>
                        </DialogFooter>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}

function VideoModel(props: {
    id: number;
    streamTitle: string;
    streamingUid: string;
    streamerId: number;
    updatedAt: Date | null;
    streamerName: string;
    thumbnail: string;
}) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/stream/${props.streamingUid}`)}
            role="button"
            className="p-3 hover:opacity-90 max-h-[40vh] flex flex-col rounded"
        >
            <div>
                <img className="rounded-md" src={props.thumbnail} />
            </div>
            <div className="flex gap-x-1 items-center">
                <img
                    className="size-5 rounded-full"
                    src={`https://placehold.co/400?id=${props.streamerId}`}
                />
                <span className="text-sm truncate font-medium text-emerald-500">
                    {props.streamerName}
                </span>
            </div>
            <div className="mt-2 text-xs">{props.streamTitle}</div>
        </div>
    );
}

function NotificationModel() {
    return (
        <div className="p-1 rounded hover:bg-neutral-900 cursor-pointer">
            <div className="text-xs bg-neutral-900 rounded py-1 text-neutral-400 px-2 items-center flex justify-between">
                <span>
                    I am very very Excited for every new Series Harry Bhai !!
                </span>

                <Reply className="size-4" />
            </div>
            <div className="flex pt-2 pb-1 px-1">
                <div className="flex gap-x-1 items-center">
                    <img
                        className="size-5 rounded-full"
                        src={`https://placehold.co/400?id={props.username}`}
                    />
                    <span className="text-sm truncate font-medium text-emerald-500">
                        srvjha:
                    </span>
                </div>
                <div>
                    <p className="text-neutral-200 text-sm flex-1 px-2">
                        {/* {props.message} */}
                        Me too sir
                    </p>
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
    const navigate = useNavigate();

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

    const [loading, setLoading] = useState(false);

    const handleCreateStream: MouseEventHandler<HTMLButtonElement> =
        React.useCallback(
            async (e) => {
                e.preventDefault();
                await requestHandler(
                    startNewStream({
                        title: formData.title,
                        about: formData.about,
                        chatSlowMode: formData.slowChatMode,
                        youtubeVideoUrl: "https://" + formData.videoUrl.trim(),
                        thumbnailUrl: formData.thumbnail ?? undefined,
                    }),
                    setLoading,
                    (res) => {
                        navigate(`/stream/${res.data.stream.streamingUid}`);
                    }
                );
            },
            [requestHandler, startNewStream, setLoading, navigate, formData]
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
                                                className="size-full object-cover opacity-50"
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
                        <Button
                            disabled={loading}
                            onClick={handleCreateStream}
                            type="submit"
                        >
                            {loading ? (
                                <LoaderCircle className="animate-spin text-neutral-900" />
                            ) : null}
                            Start chat{" "}
                            {!loading && <MessageSquareCodeIcon />}{" "}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
