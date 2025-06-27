// Your live tunnel link (replace this every time you start new tunnel)
const ltLink = "https://abc123.loca.lt"; // <-- Change this to your current LT link

// Optional: Try checking if link is online before redirecting
fetch(ltLink, { method: "HEAD", mode: "no-cors" })
  .then(() => {
    window.location.href = ltLink;
  })
  .catch(() => {
    document.getElementById("manualLink").href = ltLink;
    alert("Server seems offline. Click the link manually if needed.");
  });
