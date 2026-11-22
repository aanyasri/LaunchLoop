import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../../services/api/teamService';
import { TrialSprint, SprintTask, SprintTaskStatus } from '../../types/team';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { FormInput } from '../../shared/components/forms/FormInput';
import {
  Calendar,
  User,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const COLUMNS: Array<{ status: SprintTaskStatus; label: string; color: string }> = [
  { status: 'TODO', label: 'To Do', color: 'border-slate-300 bg-slate-100 text-slate-800' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-indigo-300 bg-indigo-50 text-indigo-900' },
  { status: 'REVIEW', label: 'Review', color: 'border-amber-300 bg-amber-50 text-amber-900' },
  { status: 'DONE', label: 'Completed', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
];

export const TrialSprintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sprint, setSprint] = useState<TrialSprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New task inline form
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadSprint() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await teamService.getActiveSprint();
        if (isMounted) {
          setSprint(data);
          if (data) {
            setNewTaskAssignee(data.partnerName);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load trial sprint');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadSprint();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleMoveTask = async (taskId: string, targetStatus: SprintTaskStatus) => {
    if (!sprint) return;
    try {
      const updated = await teamService.updateSprintTaskStatus({
        sprintId: sprint.id,
        taskId,
        newStatus: targetStatus,
      });
      setSprint(updated);
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint || !newTaskTitle.trim()) return;

    const newTask: SprintTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      assigneeName: newTaskAssignee || sprint.partnerName,
      status: 'TODO',
    };

    setSprint({
      ...sprint,
      tasks: [...sprint.tasks, newTask],
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-xs text-slate-500">
        Loading trial sprint board...
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">No Active Trial Sprint</h1>
        <p className="text-xs text-slate-500">
          Match with a co-founder candidate in the Team Finder to start a 1-week trial sprint.
        </p>
        <Link to="/team">
          <Button variant="primary" size="sm">
            Find Co-Founders
          </Button>
        </Link>
      </div>
    );
  }

  const completedCount = sprint.tasks.filter((t) => t.status === 'DONE').length;
  const progressPct = Math.round((completedCount / (sprint.tasks.length || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/team"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-700 flex items-center gap-1"
        >
          ← Back to Team Finder
        </Link>
        <Badge variant="brand">{sprint.status} Sprint</Badge>
      </div>

      {/* Sprint Header Card */}
      <Card className="p-6 bg-white border-indigo-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                1-Week Co-Founder Trial Sprint
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Venture: {sprint.ventureName}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{sprint.title}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              Trial sprints let matched co-founders build a tangible mini-task together before
              discussing equity split or making a multi-year commitment.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">{sprint.partnerName}</span>
                <span className="text-[11px] text-slate-500">{sprint.partnerRole}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Timeline</span>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>7 Days ({sprint.startDate} to {sprint.endDate})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint Task Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 font-medium">Sprint Completion</span>
              <span className="font-bold text-slate-900">
                {completedCount} of {sprint.tasks.length} tasks completed ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="shrink-0 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Task</span>
          </Button>
        </div>

        {/* Inline Add Task Form */}
        {isAddingTask && (
          <form
            onSubmit={handleAddTask}
            className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
          >
            <h3 className="font-bold text-slate-900">Add Sprint Mini-Task</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <FormInput
                  label="Task Title"
                  required
                  placeholder="e.g. Conduct thermal loss test on prototype crate"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <FormInput
                  label="Assignee Name"
                  required
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Add to Board
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Click-to-Move Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = sprint.tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between min-h-[400px]"
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${col.color}`}
                    >
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{colTasks.length}</span>
                </div>

                {/* Task Cards in this Column */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="py-10 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-3.5 bg-white shadow-xs border-slate-200 space-y-2.5"
                      >
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="font-medium text-slate-700">{task.assigneeName}</span>
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            Active
                          </span>
                        </div>

                        {/* One-Click Move Controls (Accessible Click-to-Move) */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {col.status !== 'TODO' && (
                            <button
                              type="button"
                              onClick={() => {
                                const prevStatus =
                                  col.status === 'DONE'
                                    ? 'REVIEW'
                                    : col.status === 'REVIEW'
                                      ? 'IN_PROGRESS'
                                      : 'TODO';
                                handleMoveTask(task.id, prevStatus);
                              }}
                              className="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded hover:bg-slate-200 transition-colors flex items-center gap-0.5"
                              title="Move back"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                              <span>Back</span>
                            </button>
                          )}

                          {col.status !== 'DONE' && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  col.status === 'TODO'
                                    ? 'IN_PROGRESS'
                                    : col.status === 'IN_PROGRESS'
                                      ? 'REVIEW'
                                      : 'DONE';
                                handleMoveTask(task.id, nextStatus);
                              }}
                              className={`ml-auto px-2 py-1 text-[10px] font-semibold rounded transition-colors flex items-center gap-0.5 ${col.status === 'REVIEW'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                              title="Advance task status"
                            >
                              {col.status === 'REVIEW' ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Mark Done</span>
                                </>
                              ) : (
                                <>
                                  <span>Advance</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Column Footer */}
              <div className="pt-3 text-center">
                <span className="text-[10px] text-slate-400">
                  Click button on cards to shift status
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TrialSprintPage;
