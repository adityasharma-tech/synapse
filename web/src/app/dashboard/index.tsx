import React, { useState } from "react";
import Header from "../../components/header";
import TextInput from "../../components/cui/TextInput";

import { FormEventHandler, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../../store";
import { getAllStreams, startNewStream } from "../../lib/apiClient";
import { requestHandler } from "../../lib/requestHandler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { githubUrl } from "../../lib/constants";

export default function DashboardPage() {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.app.user);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);

  const [streamLoading, setStreamLoading] = useState(false);

  const handleCreateStream: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      await requestHandler(
        startNewStream({
          title,
        }),
        setLoading,
        (res) => {
          navigate(`/stream/${res.data.stream.streamingUid}`);
        }
      );
    },
    [title, requestHandler, startNewStream, setLoading, navigate]
  );

  const handleFetchStreams = useCallback(async () => {
    await requestHandler(
      getAllStreams(),
      setStreamLoading,
      (result) => {
        setStreams(result.data.data);
      },
      undefined
    );
  }, [requestHandler, getAllStreams, setStreams]);

  React.useEffect(() => {
    handleFetchStreams();
  }, [user]);

  return (
    <React.Fragment>
      <Header>
        {user?.role == "streamer" ? (
          " "
        ) : user?.role == "viewer" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <img
                src="https://eu.ui-avatars.com/api/?name=John+Doe&size=35"
                className="rounded-full cursor-pointer size-10"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-neutral-100">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuItem>
                <a target="_blank" href={githubUrl}>Github</a>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button className="cursor-pointer" onClick={()=>navigate('/user/logout')}>Log out</button>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : user?.role == "admin" ? (
          <Link to="/dashboard/streamer-applications">
            <button className="border cursor-pointer border-neutral-400 rounded-md px-5 py-2 capitalize font-medium">
              View applications
            </button>
          </Link>
        ) : null}
      </Header>
      <section className="h-[calc(100vh-72px)] flex flex-col">
        
      </section>
    </React.Fragment>
  );
}
