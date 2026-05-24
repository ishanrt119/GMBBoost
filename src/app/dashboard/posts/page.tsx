"use client";
import { useEffect, useState } from "react";


import API from "@/services/api";

import {
  useRouter
} from "next/navigation";

function MyPosts() {

  const router =
    useRouter();

  const [posts, setPosts] =
    useState<any[]>([]);

  useEffect(() => {

    fetchPosts();

  }, []);

  const fetchPosts =
    async () => {

      try {

        const res =
          await API.get(
            "/posts/my-posts"
          );

        setPosts(
          res.data.posts
        );

      }

      catch (error) {

        console.log(error);

      }

    };

  const deletePost =
    async (postId: number | string) => {

      try {

        await API.delete(
          `/posts/delete/${postId}`
        );

        fetchPosts();

      }

      catch (error) {

        console.log(error);

      }

    };

  return (

    <div>

        <div
          className="
          flex
          justify-between
          items-center
          mb-10
          "
        >

          <div>

            <h1
              className="
              text-4xl font-bold text-white
              "
            >

              My Posts

            </h1>

            <p
              className="
              text-white/60
              mt-2
              "
            >

              Manage all your content posts

            </p>

          </div>

          <button
            onClick={() =>
              router.push("/create-post")
            }
            className="
            px-6
            py-3
            rounded-2xl
            text-white
            font-semibold
            bg-gradient-to-r
            from-blue-600
            to-purple-600
            shadow-md
            hover:scale-105
            transition
            "
          >

            + Create New

          </button>

        </div>

        {

          posts.length === 0 ? (

            <div
              className="
              bg-white/5 border border-white/10 backdrop-blur-md
              rounded-3xl
              p-10
              shadow-md
              text-center
              "
            >

              <h2
                className="
                text-2xl font-semibold text-white
                mb-3
                "
              >

                No Posts Found

              </h2>

              <p className="text-white/60">

                Your created posts
                will appear here.

              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {

                posts.map((post) => (

                  <div
                    key={post.id}
                    className="
                    bg-white/5 border border-white/10 backdrop-blur-md
                    rounded-3xl
                    p-6
                    shadow-md
                    hover:shadow-xl
                    transition
                    "
                  >

                    <div
                      className="
                      flex
                      justify-between
                      items-start
                      "
                    >

                      <div className="w-3/4">

                        <h2
                          className="
                          text-2xl font-semibold text-white
                          "
                        >

                          {post.title}

                        </h2>

                        <p
                          className="
                          text-white/60
                          mt-3
                          leading-relaxed
                          "
                        >

                          {post.content}

                        </p>

                        <p
                          className="
                          text-sm
                          text-white/40
                          mt-4
                          "
                        >

                          Created:
                          {" "}
                          {
                            new Date(
                              post.createdAt
                            ).toLocaleString()
                          }

                        </p>

                        {
                          post.scheduledFor && (

                            <p
                              className="
                              text-sm
                              text-purple-500
                              mt-2
                              "
                            >

                              Scheduled:
                              {" "}
                              {
                                new Date(
                                  post.scheduledFor
                                ).toLocaleString()
                              }

                            </p>

                          )
                        }

                      </div>

                      <div
                        className="
                        flex
                        flex-col
                        items-end
                        gap-3
                        "
                      >

                        <span
                          className="
                          px-4
                          py-2
                          rounded-full
                          bg-blue-100
                          text-blue-700
                          font-medium
                          "
                        >

                          {post.status}

                        </span>

                        <div className="flex gap-3">

                          <button
                            onClick={() =>
                              router.push(
                                `/create-post?id=${post.id}`
                              )
                            }
                            className="
                            px-4
                            py-2
                            rounded-xl
                            bg-purple-100
                            text-purple-700
                            hover:bg-purple-200
                            "
                          >

                            Edit

                          </button>

                          <button
                            onClick={() =>
                              deletePost(post.id)
                            }
                            className="
                            px-4
                            py-2
                            rounded-xl
                            bg-red-100
                            text-red-700
                            hover:bg-red-200
                            "
                          >

                            Delete

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

  );

}

export default MyPosts;