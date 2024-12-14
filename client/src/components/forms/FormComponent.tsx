import React, { ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import { SocketEvent } from "@/types/socket";
import { USER_STATUS } from "@/types/user";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const FormComponent: React.FC = () => {
    const location = useLocation();
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext();
    const { socket } = useSocket();

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuid() });
        toast.success("Created a new Room Id");
        usernameRef.current?.focus();
    };

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setCurrentUser({ ...currentUser, [name]: value });
    };

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username");
            return false;
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id");
            return false;
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long");
            return false;
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long");
            return false;
        }
        return true;
    };

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === USER_STATUS.ATTEMPTING_JOIN) return;
        if (!validateForm()) return;
        toast.loading("Joining room...");
        setStatus(USER_STATUS.ATTEMPTING_JOIN);
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser);
    };

    useEffect(() => {
        if (currentUser.roomId.length > 0) return;
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId });
            if (currentUser.username.length === 0) {
                toast.success("Enter your username");
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser]);

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect();
            return;
        }

        const isRedirect = sessionStorage.getItem("redirect") || false;

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username;
            sessionStorage.setItem("redirect", "true");
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            });
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect");
            setStatus(USER_STATUS.DISCONNECTED);
            socket.disconnect();
            socket.connect();
        }
    }, [
        currentUser,
        location.state?.redirect,
        navigate,
        setStatus,
        socket,
        status,
    ]);

    return (
        <div className="flex min-h-screen items-center justify-center overflow-hidden">
            <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 text-gray-100 sm:p-8 md:w-[400px]">
                <p className="mb-6 text-center text-2xl font-bold">
                    Stream Share
                </p>
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Join Room
                </h1>
                <form onSubmit={joinRoom} className="space-y-4">
                    <div>
                        <label
                            htmlFor="roomId"
                            className="mb-1 block text-sm text-gray-400"
                        >
                            Room Id
                        </label>
                        <input
                            type="text"
                            id="roomId"
                            name="roomId"
                            value={currentUser.roomId}
                            onChange={handleInputChanges}
                            className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 focus:border-purple-400 focus:outline-none"
                            placeholder="Enter Room ID"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-1 block text-sm text-gray-400"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={currentUser.username}
                            onChange={handleInputChanges}
                            ref={usernameRef}
                            className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-gray-100 focus:border-purple-400 focus:outline-none"
                            placeholder="Enter Username"
                        />
                    </div>
                    <div className="mb-4 text-center">
                        <button
                            type="button"
                            onClick={createNewRoomId}
                            className="text-sm text-gray-300 underline hover:text-white"
                        >
                            Generate Unique Room ID
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded bg-blue-600 py-2 font-semibold text-gray-900 transition-colors hover:bg-blue-800"
                    >
                        Join
                    </button>
                </form>
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <div className="h-px w-full bg-gray-700"></div>
                        <p className="px-3 text-sm text-gray-400">Login with</p>
                        <div className="h-px w-full bg-gray-700"></div>
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            aria-label="Log in with Google"
                            className="rounded-md p-2 transition-colors hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
                            </svg>
                        </button>
                        <button
                            aria-label="Log in with Twitter"
                            className="rounded-md p-2 transition-colors hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M31.937 6.093c-1.177 0.516-2.437 0.871-3.765 1.032 1.355-0.813 2.391-2.099 2.885-3.631-1.271 0.74-2.677 1.276-4.172 1.579-1.192-1.276-2.896-2.079-4.787-2.079-3.625 0-6.563 2.937-6.563 6.557 0 0.521 0.063 1.021 0.172 1.495-5.453-0.255-10.287-2.875-13.52-6.833-0.568 0.964-0.891 2.084-0.891 3.303 0 2.281 1.161 4.281 2.916 5.457-1.073-0.031-2.083-0.328-2.968-0.817v0.079c0 3.181 2.26 5.833 5.26 6.437-0.547 0.145-1.131 0.229-1.724 0.229-0.421 0-0.823-0.041-1.224-0.115 0.844 2.604 3.26 4.5 6.14 4.557-2.239 1.755-5.077 2.801-8.135 2.801-0.521 0-1.041-0.025-1.563-0.088 2.917 1.86 6.36 2.948 10.079 2.948 12.067 0 18.661-9.995 18.661-18.651 0-0.276 0-0.557-0.021-0.839 1.287-0.917 2.401-2.079 3.281-3.396z"></path>
                            </svg>
                        </button>
                        <button
                            aria-label="Log in with GitHub"
                            className="rounded-md p-2 transition-colors hover:bg-gray-700"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                className="h-5 w-5 fill-current"
                            >
                                <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z"></path>
                            </svg>
                        </button>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Don't have an account?
                        <a className="ml-1 text-gray-100 hover:underline">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FormComponent;
