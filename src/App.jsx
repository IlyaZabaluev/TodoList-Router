import { Routes, Route, Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { useState, useEffect } from 'react';

export const App = () => {
	const [newTask, setNewTask] = useState('');
	const [searchTask, setSearchTask] = useState('');
	const [updateListFlag, setUpdateListFlag] = useState(false);
	const [comments, setComments] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdeting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const history = useNavigate();

	useEffect(() => {
		setIsLoading(true);

		fetch('http://localhost:3005/tasks')
			.then((loadedData) => loadedData.json())
			.then((loadedComments) => {
				setComments(loadedComments);
			})
			.finally(() => setIsLoading(false));
	}, [updateListFlag]);

	const requestAddTask = () => {
		setIsCreating(true);
		setNewTask('');

		fetch('http://localhost:3005/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json;charset=utf-8' },
			body: JSON.stringify({
				title: newTask,
			}),
		})
			.then((rawResponse) => rawResponse.json())
			.then((response) => {
				setUpdateListFlag(!updateListFlag);
			})
			.finally(() => setIsCreating(false));
	};

	const requestUpdateTask = (id, title) => {
		setIsUpdeting(true);
		setNewTask(title);

		fetch(`http://localhost:3005/tasks/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json;charset=utf-8' },
			body: JSON.stringify({
				title: newTask,
			}),
		})
			.then((rawResponse) => rawResponse.json())
			.then((response) => {
				setUpdateListFlag(!updateListFlag);
			})
			.finally(() => setIsUpdeting(false));
	};

	const requestDeleteTask = (id) => {
		setIsDeleting(true);

		fetch(`http://localhost:3005/tasks/${id}`, {
			method: 'DELETE',
		})
			.then((rawResponse) => rawResponse.json())
			.then((response) => {
				setUpdateListFlag(!updateListFlag);
			})
			.finally(() => setIsDeleting(false));
		history('/');
	};

	const getSortTasks = () => {
		const sorted = [...comments].sort((a, b) => {
			if (a['title'] < b['title']) return -1;
		});
		setComments(sorted);
	};

	const filtredTask = comments.filter((task) => {
		return task.title.toLowerCase().includes(searchTask.toLowerCase());
	});

	const Todo = () => {
		const { id } = useParams();
		const [task, setTask] = useState('');

		useEffect(() => {
			fetch(`http://localhost:3005/tasks/${id}`)
				.then((response) => response.json())
				.then((data) => setTask(data));
		}, [id]);

		const handleGoBack = () => {
			history('/');
		};

		if (task.id === undefined) {
			return <TaskNotFound />;
		}

		return (
			<div className={styles.window}>
				<div className={styles.list}>
					<h2 className={styles.task}>{task.title}</h2>
				</div>
				<div className={styles.buttons}>
					<button className={styles.btn} onClick={() => handleGoBack()}>
						Back
					</button>
					<button
						disabled={isUpdating}
						className={styles.btn}
						onClick={() => requestUpdateTask(id, task.title)}
					>
						Сhange
					</button>
					<button
						disabled={isDeleting}
						className={styles.btn}
						onClick={() => requestDeleteTask(id)}
					>
						Delete
					</button>
				</div>
			</div>
		);
	};

	const Todolist = () => (
		<div>
			<Outlet />
			<ul>
				{isLoading ? (
					<div className={styles.loader}></div>
				) : (
					filtredTask.map(({ id, title }) => (
						<li key={id} className={styles.list}>
							<Link to={`todo/${id}`} className={styles.task}>
								{title.length > 20 ? title.slice(0, 20) + '...' : title}
							</Link>
						</li>
					))
				)}
			</ul>
		</div>
	);

	const TaskNotFound = () => (
		<div className={styles.error}>Такой задачи не существует</div>
	);
	const NotFound = () => (
		<div className={styles.error}>Такая страница не существует</div>
	);

	return (
		<div className={styles.app}>
			<div className={styles.title}>
				<h1>Task list :</h1>
			</div>
			<div className={styles.formInput}>
				<input
					placeholder="Enter tasks..."
					value={newTask}
					onChange={(e) => setNewTask(e.target.value)}
					className={styles.formNewTask}
					type="text"
				/>
				<button
					disabled={isCreating}
					className={styles.btnForm}
					onClick={requestAddTask}
				>
					Add Task
				</button>
				<input
					placeholder="Task search..."
					value={searchTask}
					onChange={(e) => setSearchTask(e.target.value)}
					className={styles.formNewTask}
					type="text"
				/>
				<button className={styles.btnForm} onClick={getSortTasks}>
					Sort
				</button>
			</div>

			<Routes>
				<Route path="/" element={<Todolist />}>
					<Route path="todo/:id" element={<Todo />} />
				</Route>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
};
