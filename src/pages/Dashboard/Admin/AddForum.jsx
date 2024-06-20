import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { imageUpload } from "../../../components/imageUpload";
import { Helmet } from "react-helmet-async";


const AddForum = () => {
  const { user, loading } = useAuth() || {};
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: async (ForumData) => {
      const { data } = await axiosSecure.post(`/forum`, ForumData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forums']); // Ensure the forum data is refetched after a new post
      Swal.fire({
        title: "Success!",
        text: "Post added successfully",
        icon: "success",
        confirmButtonText: "Cool",
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add post",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      console.log(error);
    },
  });

  const handleClassAdd = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const image = form.image.files[0];
    const admin = {
      name: user?.displayName,
      email: user?.email,
      image: user?.photoURL,
    };
    try {
      const image_url = await imageUpload(image);
      const ForumData = { title, description, image: image_url, admin };
      console.table(ForumData);
      await mutateAsync(ForumData);
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "Error!",
        text: "Failed to upload image",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <div>
      <Helmet>
        <title>Admin | Add Post</title>
      </Helmet>
      <div className="text-lg bg-violet-900 font-bold p-4 md:p-8 lg:p-16 my-16 mx-2 rounded-md">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-lato text-center font-extrabold mb-6">
          Add Post
        </h2>

        <form onSubmit={handleClassAdd} className="space-y-4">
          {/* Post Title and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-lg font-bold">
                  Post Title
                </span>
              </label>
              <input
                required
                type="text"
                name="title"
                placeholder="Post Title"
                className="input input-bordered input-double-line p-3"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white text-lg font-bold">
                  Image
                </span>
              </label>
              <input
                required
                type="file"
                name="image"
                className="input input-bordered input-double-line p-3"
                accept="image/*"
              />
            </div>
          </div>
          {/* Post Details */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white text-lg font-bold">
                Post Description
              </span>
            </label>
            <textarea
              required
              name="description"
              placeholder="Post Description"
              className="input input-bordered input-double-line p-3"
            />
          </div>
          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-violet-500"
          >
            {loading ? (
              <TbFidgetSpinner className="animate-spin m-auto" />
            ) : (
              "Save Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddForum;
