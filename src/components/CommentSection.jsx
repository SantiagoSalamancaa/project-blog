import { Alert, Textarea } from "flowbite-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import Comment from "./Comment";

export default function CommentSection({ postId }) {
    const { currentUser } = useSelector(state => state.user);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState(null);
    const [comments, setComments] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (comment.length > 200) {
            return;
        }
        try {
            const res = await fetch('/api/comment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: comment, postId, userId: currentUser._id }),
            });
            const data = await res.json();
            if (res.ok) {
                setComment('');
                setCommentError(null);
                setComments([data, ...comments]);
            }
        } catch (error) {
            setCommentError(error.message)
        }
    };

    useEffect(() => {
        const getComments = async () => {
          try {
            const res = await fetch(`/api/comment/getPostComments/${postId}`);
            if (res.ok) {
              const data = await res.json();
              setComments(data);
            }
          } catch (error) {
            console.log(error.message);
          }
        };
        getComments();
      }, [postId]);

    return (
        <div className="max-w-2xl mx-auto w-full p-3">
            {currentUser ? (
                <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
                    <p>Sesión iniciada como:</p>
                    <img className='h-5 w-5 object-cover rounded-full' src={currentUser.profilePicture} alt="" />
                    <Link to={'/dashboard?tab=profile'} className="text-xs text-cyan-600 hover:underline">
                        @{currentUser.username}
                    </Link>
                </div>
            ) : (
                <div className="text-sm text-teal-500 my-5 flex gap-1">
                    Debes tener sesión iniciada para poder comentar.
                    <Link className="text-blue-400 hover:underline" to={'/sign-in'}>
                        Iniciar sesión.
                    </Link>
                </div>
            )}
            {currentUser && (
                <form onSubmit={handleSubmit} className="border border-teal-500 rounded-md p-3">
                    <Textarea
                        placeholder='Agregar un comentario...'
                        rows='3'
                        maxLength='200'
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                    />
                    <div className="flex justify-between">
                        <p className="text-gray-500 text-xs">{200 - comment.length} caracteres permitidos</p>
                        <Button outline gradientDuoTone='purpleToBlue' type="submit">
                            Subir comentario
                        </Button>
                    </div>
                    {commentError && (
                        <Alert color="failure" className='mt-5'>{commentError}</Alert>
                    )}
                </form>
            )}
            {comments.length === 0 ? (
                <p className="text-sm my-5">No hay comentarios</p>
            ) : (
                <>
                    <div className="text-sm my-5 flex items-center gap-1">
                        <p>Comentarios</p>
                        <div className="border border-gray-400 py-1 px-2 rounded-sm">
                            <p>{comments.length}</p>
                        </div>
                    </div>
                    {comments.map(comment => (
                        <Comment key={comment._id} comment={comment} />
                    ))}
                </>
            )}
        </div>
    );
}
