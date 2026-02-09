import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const token = localStorage.getItem("token");

  // Fetch videos automatically
  useEffect(() => {
    if (token) fetchVideos();
  }, [token]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/videos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  // LOGIN
  const handleLogin = async () => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password
    });

    localStorage.setItem("token", res.data.token);
    window.location.reload();
  };

  // UPLOAD
  const handleUpload = async () => {
    if (!file || !title) return alert("Enter title & choose file");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("video", file);

    try {
      setUploading(true);
      setProgress(0);

      await axios.post("http://localhost:5000/api/videos", formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setProgress(percent);
        }
      });

      setTitle("");
      setFile(null);
      fetchVideos();   // auto refresh
    } catch (err) {
      console.log(err);
    }

    setUploading(false);
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // ======================
  // LOGIN UI
  // ======================
  if (!token) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <h2>🎬 Video Platform</h2>

          <input
            style={styles.input}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // ======================
  // MAIN UI
  // ======================
  return (
    <div style={styles.container}>
      <h1>🎬 Video Platform</h1>
      <button onClick={logout}>Logout</button>

      <hr />

      <h3>Upload Video</h3>

      <input
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button disabled={uploading} onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* PROGRESS BAR */}
      {uploading && (
        <div style={styles.progressWrapper}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`
            }}
          />
          <p>{progress}%</p>
        </div>
      )}

      <hr />

      <h2>Your Videos</h2>

      {videos.map((v) => (
        <div key={v._id} style={styles.card}>
          <p>{v.title}</p>
          <video
            width="250"
            controls
            src={`http://localhost:5000/uploads/${v.filename}`}
          />
        </div>
      ))}
    </div>
  );
}

// ======================
// STYLES
// ======================

const styles = {
  loginPage: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f3f3"
  },
  loginBox: {
    background: "white",
    padding: 30,
    borderRadius: 10,
    width: 300,
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  container: {
    padding: 20
  },
  progressWrapper: {
    width: 300,
    background: "#ddd",
    marginTop: 10
  },
  progressBar: {
    height: 10,
    background: "green"
  },
  card: {
    marginBottom: 20,
    border: "1px solid #ddd",
    padding: 10,
    width: 260
  }
};
