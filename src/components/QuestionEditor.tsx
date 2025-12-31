import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  HelpCircle,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useVideoQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "../hooks";
import { Card, Button, Input, Alert } from "./ui";
import type { QuestionWithAnswers, AnswerInput } from "../schemas";

interface QuestionEditorProps {
  videoId: string;
}

interface AnswerFormData {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormData {
  text: string;
  answers: AnswerFormData[];
}

const emptyAnswer = (): AnswerFormData => ({
  text: "",
  isCorrect: false,
});

const emptyQuestion = (): QuestionFormData => ({
  text: "",
  answers: [emptyAnswer(), emptyAnswer()],
});

export function QuestionEditor({ videoId }: QuestionEditorProps) {
  const { data, isLoading, error } = useVideoQuestions(videoId);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState<QuestionFormData>(emptyQuestion());
  const [editForm, setEditForm] = useState<QuestionFormData | null>(null);

  const questions = data?.questions ?? [];

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const startEditing = (question: QuestionWithAnswers) => {
    setEditingQuestion(question.id);
    setEditForm({
      text: question.text,
      answers: question.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    });
    setExpandedQuestions((prev) => new Set(prev).add(question.id));
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion || !editForm) return;
    if (!editForm.text.trim() || editForm.answers.some((a) => !a.text.trim())) return;

    try {
      await updateQuestion.mutateAsync({
        id: editingQuestion,
        videoId,
        data: {
          text: editForm.text,
          answers: editForm.answers.map((a, i) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
            order: i,
          })),
        },
      });
      cancelEditing();
    } catch {
      // Error handled by mutation
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.text.trim() || newQuestion.answers.some((a) => !a.text.trim())) return;

    try {
      await createQuestion.mutateAsync({
        videoId,
        data: {
          text: newQuestion.text,
          answers: newQuestion.answers.map((a, i) => ({
            text: a.text,
            isCorrect: a.isCorrect,
            order: i,
          })),
        },
      });
      setNewQuestion(emptyQuestion());
      setIsAddingNew(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestion.mutateAsync({ id: questionId, videoId });
    } catch {
      // Error handled by mutation
    }
  };

  // Form handlers for new question
  const updateNewQuestionText = (text: string) => {
    setNewQuestion((prev) => ({ ...prev, text }));
  };

  const updateNewAnswerText = (index: number, text: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((a, i) => (i === index ? { ...a, text } : a)),
    }));
  };

  const toggleNewAnswerCorrect = (index: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((a, i) => (i === index ? { ...a, isCorrect: !a.isCorrect } : a)),
    }));
  };

  const addNewAnswer = () => {
    setNewQuestion((prev) => ({
      ...prev,
      answers: [...prev.answers, emptyAnswer()],
    }));
  };

  const removeNewAnswer = (index: number) => {
    if (newQuestion.answers.length <= 2) return;
    setNewQuestion((prev) => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  // Form handlers for editing
  const updateEditQuestionText = (text: string) => {
    if (!editForm) return;
    setEditForm((prev) => prev && { ...prev, text });
  };

  const updateEditAnswerText = (index: number, text: string) => {
    if (!editForm) return;
    setEditForm((prev) =>
      prev && {
        ...prev,
        answers: prev.answers.map((a, i) => (i === index ? { ...a, text } : a)),
      }
    );
  };

  const toggleEditAnswerCorrect = (index: number) => {
    if (!editForm) return;
    setEditForm((prev) =>
      prev && {
        ...prev,
        answers: prev.answers.map((a, i) => (i === index ? { ...a, isCorrect: !a.isCorrect } : a)),
      }
    );
  };

  const addEditAnswer = () => {
    if (!editForm) return;
    setEditForm((prev) =>
      prev && {
        ...prev,
        answers: [...prev.answers, emptyAnswer()],
      }
    );
  };

  const removeEditAnswer = (index: number) => {
    if (!editForm || editForm.answers.length <= 2) return;
    setEditForm((prev) =>
      prev && {
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">Failed to load questions: {error.message}</Alert>;
  }

  const hasCorrectAnswer = (answers: AnswerFormData[]) => answers.some((a) => a.isCorrect);

  return (
    <div className="space-y-4">
      {/* Questions List */}
      {questions.length === 0 && !isAddingNew ? (
        <div className="text-center py-12 border-2 border-dashed border-border-default rounded-lg">
          <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-4">No questions yet</p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddingNew(true)}
          >
            Add First Question
          </Button>
        </div>
      ) : (
        <>
          {questions.map((question, qIndex) => {
            const isEditing = editingQuestion === question.id;
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <Card key={question.id} variant="default" padding="none" className="overflow-hidden">
                {/* Question Header */}
                <div
                  className={`
                    flex items-center gap-3 p-4 cursor-pointer transition-colors
                    ${isExpanded ? "bg-bg-elevated border-b border-border-subtle" : "hover:bg-bg-hover"}
                  `}
                  onClick={() => !isEditing && toggleExpanded(question.id)}
                >
                  <div className="text-text-muted">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-muted bg-bg-elevated px-2 py-0.5 rounded">
                        Q{qIndex + 1}
                      </span>
                      <span className="text-text-primary font-medium truncate">
                        {question.text}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {question.answers.length} answers •{" "}
                      {question.answers.filter((a) => a.isCorrect).length} correct
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(question)}
                      disabled={isEditing}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      isLoading={deleteQuestion.isPending}
                      className="text-status-error hover:bg-status-error-bg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 bg-bg-primary">
                    {isEditing && editForm ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <Input
                          label="Question Text"
                          value={editForm.text}
                          onChange={(e) => updateEditQuestionText(e.target.value)}
                          placeholder="Enter your question..."
                        />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-text-secondary">
                              Answers
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<Plus className="w-3 h-3" />}
                              onClick={addEditAnswer}
                            >
                              Add Answer
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {editForm.answers.map((answer, aIndex) => (
                              <div key={aIndex} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleEditAnswerCorrect(aIndex)}
                                  className={`
                                    flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                    ${
                                      answer.isCorrect
                                        ? "border-status-live bg-status-live text-white"
                                        : "border-border-default hover:border-accent"
                                    }
                                  `}
                                  title={answer.isCorrect ? "Mark as incorrect" : "Mark as correct"}
                                >
                                  {answer.isCorrect && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <input
                                  type="text"
                                  value={answer.text}
                                  onChange={(e) => updateEditAnswerText(aIndex, e.target.value)}
                                  placeholder={`Answer ${aIndex + 1}`}
                                  className="
                                    flex-1 bg-bg-input border border-border-default rounded-md px-3 py-2
                                    text-text-primary placeholder:text-text-muted text-sm
                                    focus:outline-none focus:ring-1 focus:border-accent focus:ring-accent/50
                                  "
                                />
                                {editForm.answers.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEditAnswer(aIndex)}
                                    className="flex-shrink-0 p-1.5 text-text-muted hover:text-status-error transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {!hasCorrectAnswer(editForm.answers) && (
                            <p className="text-xs text-status-warning mt-2">
                              ⚠️ Mark at least one answer as correct
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                          <Button variant="ghost" onClick={cancelEditing}>
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={handleSaveEdit}
                            isLoading={updateQuestion.isPending}
                            disabled={
                              !editForm.text.trim() ||
                              editForm.answers.some((a) => !a.text.trim()) ||
                              !hasCorrectAnswer(editForm.answers)
                            }
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div
                            key={answer.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border
                              ${
                                answer.isCorrect
                                  ? "border-status-live bg-status-live-bg"
                                  : "border-border-subtle bg-bg-elevated"
                              }
                            `}
                          >
                            {answer.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-status-live flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm ${answer.isCorrect ? "text-text-primary font-medium" : "text-text-secondary"}`}
                            >
                              {answer.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* Add New Question Form */}
      {isAddingNew ? (
        <Card variant="elevated" padding="lg" className="border-2 border-accent border-dashed">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
              <Plus className="w-4 h-4 text-accent" />
            </div>
            <h4 className="text-lg font-medium text-text-primary">New Question</h4>
          </div>

          <div className="space-y-4">
            <Input
              label="Question Text"
              value={newQuestion.text}
              onChange={(e) => updateNewQuestionText(e.target.value)}
              placeholder="Enter your question..."
              autoFocus
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">
                  Answers{" "}
                  <span className="font-normal text-text-muted">(click circle to mark correct)</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus className="w-3 h-3" />}
                  onClick={addNewAnswer}
                >
                  Add Answer
                </Button>
              </div>

              <div className="space-y-2">
                {newQuestion.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleNewAnswerCorrect(index)}
                      className={`
                        flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${
                          answer.isCorrect
                            ? "border-status-live bg-status-live text-white"
                            : "border-border-default hover:border-accent"
                        }
                      `}
                      title={answer.isCorrect ? "Mark as incorrect" : "Mark as correct"}
                    >
                      {answer.isCorrect && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => updateNewAnswerText(index, e.target.value)}
                      placeholder={`Answer ${index + 1}`}
                      className="
                        flex-1 bg-bg-input border border-border-default rounded-md px-3 py-2
                        text-text-primary placeholder:text-text-muted text-sm
                        focus:outline-none focus:ring-1 focus:border-accent focus:ring-accent/50
                      "
                    />
                    {newQuestion.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeNewAnswer(index)}
                        className="flex-shrink-0 p-1.5 text-text-muted hover:text-status-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!hasCorrectAnswer(newQuestion.answers) && newQuestion.text.trim() && (
                <p className="text-xs text-status-warning mt-2">
                  ⚠️ Mark at least one answer as correct
                </p>
              )}
            </div>

            {createQuestion.error && (
              <Alert variant="error">{createQuestion.error.message}</Alert>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewQuestion(emptyQuestion());
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateQuestion}
                isLoading={createQuestion.isPending}
                disabled={
                  !newQuestion.text.trim() ||
                  newQuestion.answers.some((a) => !a.text.trim()) ||
                  !hasCorrectAnswer(newQuestion.answers)
                }
              >
                Add Question
              </Button>
            </div>
          </div>
        </Card>
      ) : questions.length > 0 ? (
        <Button
          variant="secondary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddingNew(true)}
          className="w-full"
        >
          Add Question
        </Button>
      ) : null}
    </div>
  );
}


