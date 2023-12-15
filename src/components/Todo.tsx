import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import companyLogo from '../images/reliability_logo.png';
import plusIcon from '../images/plus.png';
import deleteIcon from "../images/remove.png";
import editIcon from "../images/edit.png";
import prioritizeIcon from "../images/prioritize.png";
import "../../CSS/todo.css";
import {
    useQuery
} from '@tanstack/react-query';
import axios from 'axios';
import { create } from 'zustand'

interface TodoItem {
    description: string;
    priority: string;
    _id: string;
}

interface AuthState {
    auth: {
        token: string | null;
        expirationTime: string | null;
    };
    setAuth: (token: string | null, expirationTime: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
    auth: {
        token: null,
        expirationTime: null,
    },
    setAuth: (token, expirationTime) => set(() => ({ auth: { token, expirationTime } })),
}));

function Todo() {

    const { data, refetch } = useQuery({
        queryKey: ['tasksData'],
        queryFn: () =>
          axios
            .get('http://localhost:3000/todos/')
            .then((res) => res.data),
    });

    const [currentDate, setCurrentDate] = useState<string>('');
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const { auth, setAuth } = useAuthStore();

    // Effect for setting the current date
    useEffect(() => {
        const now = new Date();
        const formattedDate = format(now, "EEEE, MMMM do");
        setCurrentDate(formattedDate);
    }, []); // Empty dependency array, runs only once on mount

    // Update todos when data is fetched
    useEffect(() => {
        if (data) {
            setTodos(data);
        }
    }, [data]); // Dependency on data

    useEffect(() => {
        // Mock login process
        const mockToken = "mock-jwt-token-19846394725274";
        const mockExpiration = new Date().toISOString(); // you should replace this with actual expiration logic

        setAuth(mockToken, mockExpiration);
    }, []);

    function capitalize(str:string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const openPriority = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        const parentElement = event.currentTarget.parentElement as HTMLElement;
        (parentElement.children[4] as HTMLElement).style.display = "flex";
    }

    const cancelPriority = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const grandParentElement = (event.currentTarget.parentElement?.parentElement as HTMLElement);
        (grandParentElement.children[4] as HTMLElement).style.display = "none";
    }

    const openEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        const parentElement = event.currentTarget.parentElement as HTMLElement;
        (parentElement.children[2] as HTMLElement).style.display = "block";
    }

    const cancelEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const parentElement = event.currentTarget.parentElement as HTMLElement;
        parentElement.style.display = "none";
    }

    const createTodo = async (event: React.MouseEvent<HTMLImageElement>) => {
        const targetElement = event.target as HTMLElement;
        const grandParentElement = targetElement.parentElement?.parentElement;
    
        if (!grandParentElement || grandParentElement.children.length < 1) {
            console.error("Unable to locate the input element");
            return;
        }
    
        const inputElement = grandParentElement.children[0] as HTMLInputElement;
        const description = inputElement.value;
        inputElement.value = "";
    
        const data = {
            "description": description,
            "priority": "medium"
        };
    
        try {
            const response = await fetch('http://localhost:3000/todos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            await refetch();
            console.log('New todo created:', result);
        } catch (error) {
            console.error('Error creating new todo:', error);
        }
    };
    
    const updateTodo = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent default action if needed
    
        const targetElement = event.currentTarget as HTMLElement;
        const grandParentElement = targetElement.parentElement?.parentElement;
    
        if (!grandParentElement) {
            console.error("Unable to locate the grandparent element");
            return;
        }
    
        const idInputElement = grandParentElement.children[0] as HTMLInputElement;
        const id = idInputElement.value;
        
        const oldPriorityElement = grandParentElement.parentNode!.children[1] as HTMLElement;
        const oldPriority = oldPriorityElement.textContent?.toLowerCase() ?? '';
    
        const newPrioritySelectElement = grandParentElement.children[4].children[0] as HTMLSelectElement;
        const newPriority = newPrioritySelectElement.value;
    
        const oldDescriptionElement = grandParentElement.parentNode!.children[0] as HTMLElement;
        const oldDescription = oldDescriptionElement.textContent ?? '';
    
        const newDescriptionInputElement = grandParentElement.children[2].children[0] as HTMLInputElement;
        const newDescription = newDescriptionInputElement.value;
    
        const description = newDescription !== "" ? newDescription : oldDescription;
        const priority = newPriority !== "" ? newPriority : oldPriority;
    
        const data = {
            description,
            priority,
        };
    
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            await refetch();
            console.log('Result from the backend:', result);
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/todos/${id}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Assuming your API returns the deleted todo's id
            const deletedTodoId: string = await response.json();
    
            // Update the local state to remove the deleted todo
            setTodos(prevTodos => prevTodos.filter(todo => todo._id !== deletedTodoId));
            await refetch();
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error deleting todo:', error.message);
            } else {
                console.error('Error deleting todo:', error);
            }
        }
    };

    return (
        <div className="todo__container">
            <div className="header__container">
                <div className="header__date">
                    <div className="header__date--title">
                        <img src={companyLogo} alt="reliability logo" className=""/>
                        <h1>Todo App</h1>
                    </div>
                    <p>{currentDate}</p>
                </div>
            </div>
            <div className="body__container">
                <div className="body__top">

                {auth.token ? (
                    <div>
                        {/* Content you want to display when auth.token exists */}
                        {todos.map((task) => (
                    <div className="task__container">
                        <p>{task["description"]}</p>
                        <p>{capitalize(task["priority"])}</p>
                        <input value="" className="task__active"/>
                        <div className="task__right">
                            <input value={task["_id"]} className="task__id"/>
                            <img src={editIcon} onClick={openEdit} className="task__editIcon"/>
                            <div className="task__editWindow">
                                <input/>
                                <button onClick={updateTodo}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                            </div>
                            <img onClick={openPriority} className="task__prioritizeIcon" src={prioritizeIcon} alt="Prioritize icon"/>
                            <div className="priority-dropdown-container">
                                <select 
                                    className="task__select"
                                    name="priority-dropdown"
                                    id="priority-dropdown"
                                >
                                    <option className="task__select--option" value="">Select Priority</option>
                                    <option className="task__select--option" value="low">Low</option>
                                    <option className="task__select--option" value="medium">Medium</option>
                                    <option className="task__select--option" value="high">High</option>
                                    <option className="task__select--option" value="critical">Critical</option>
                                </select>
                                <button onClick={updateTodo}>Save</button>
                                <button onClick={cancelPriority}>Cancel</button>
                            </div>
                            <img onClick={() => deleteTodo(task["_id"])} className="task__deleteIcon" src={deleteIcon} alt="Delete icon"/>
                        </div>
                    </div>
                ))}
                    </div>
                ) : (
                    null // or replace with any alternative component/view for when auth.token does not exist
                )}

                
                </div>
                {auth.token}
                <div className="body__bottom">
                    <div className="body__bottom--container">
                        <input className="body__bottom--input"/>
                        <div className="body__bottom--plusicon">
                            <img onClick={createTodo} src={plusIcon} alt="Add button"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Todo