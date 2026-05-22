import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import API from "../services/api";

import {
  useNavigate
} from "react-router-dom";

function MyPosts() {

  const navigate =
    useNavigate();

  const [posts, setPosts] =
    useState([]);

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
    async (postId) => {

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

    <div className="flex">

      <Sidebar />

      <div
        className="
        ml-64
        p-10
        w-full
        bg-slate-50
        min-h-screen
        "
      >

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
              text-4xl
              font-bold
              "
            >

              My Posts

            </h1>

            <p
              className="
              text-gray-500
              mt-2
              "
            >

              Manage all your content posts

            </p>

          </div>

          <button
            onClick={() =>
              navigate("/create-post")
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
              bg-white
              rounded-3xl
              p-10
              shadow-md
              text-center
              "
            >

              <h2
                className="
                text-2xl
                font-semibold
                mb-3
                "
              >

                No Posts Found

              </h2>

              <p className="text-gray-500">

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
                    bg-white
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
                          text-2xl
                          font-semibold
                          "
                        >

                          {post.title}

                        </h2>

                        <p
                          className="
                          text-gray-500
                          mt-3
                          leading-relaxed
                          "
                        >

                          {post.content}

                        </p>

                        <p
                          className="
                          text-sm
                          text-gray-400
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
                              navigate(
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

    </div>

  );

}

export default MyPosts;