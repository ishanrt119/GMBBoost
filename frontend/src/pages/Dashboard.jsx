import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

  try {

    const token =
      localStorage.getItem(
        "token"
      );

    console.log(
      "TOKEN:",
      token
    );

    const res =
      await API.get(
        "/dashboard/stats"
      );

    console.log(
      "API RESPONSE:",
      res.data
    );

    setStats(
      res.data
    );

  }

  catch(error){

    console.log(
      "FULL ERROR:",
      error.response
    );

  }

};

  return (

    <div className="flex">

      <Sidebar />

      <div className="ml-64 p-10 w-full bg-slate-50 min-h-screen">

        <h1
          className="
          text-4xl
          font-bold
          mb-2
          "
        >
          Dashboard
        </h1>

        <p
          className="
          text-gray-500
          mb-10
          "
        >
          Welcome to your AI Content Scheduler
        </p>

        <div
          className="
          grid
          grid-cols-3
          gap-6
          "
        >

          <Card
            title="Total Posts"
            value={
              stats.totalPosts || 0
            }
          />

          <Card
            title="Approved"
            value={
              stats.approvedPosts || 0
            }
          />

          <Card
            title="Pending"
            value={
              stats.pendingPosts || 0
            }
          />

          <Card
            title="Scheduled"
            value={
              stats.scheduledPosts || 0
            }
          />

          <Card
            title="Published"
            value={
              stats.publishedPosts || 0
            }
          />

        </div>

      </div>

    </div>

  );
}

function Card({
  title,
  value,
}) {

  return (

    <div
      className="
      bg-white
      rounded-3xl
      p-6
      shadow-md
      hover:shadow-xl
      transition
      "
    >

      <h2
        className="
        text-gray-500
        "
      >
        {title}
      </h2>

      <p
        className="
        text-4xl
        font-bold
        mt-3
        bg-gradient-to-r
        from-blue-600
        to-purple-600
        bg-clip-text
        text-transparent
        "
      >
        {value}
      </p>

    </div>

  );
}

export default Dashboard;