import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Send, Mail, User, MessageSquare } from 'lucide-react';

export function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Placeholder for Telegram Bot Logic
        console.log("Form Submitted:", formData);
        console.log("TODO: Link this to Telegram Bot API");

        // Simulate network delay
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <div className="mb-8 text-center space-y-4">
                <h1 className="text-4xl font-bold font-display text-gray-900 dark:text-gray-100">Get in Touch</h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto">
                    Have a question or feedback? Fill out the form below and I'll get back to you soon.
                </p>
            </div>

            <Card className="border-muj-yellow/40 dark:border-gray-800 shadow-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div className="h-2 bg-gradient-to-r from-muj-orange to-muj-yellow"></div>
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Contact Me</CardTitle>
                    <CardDescription className="dark:text-gray-400">Send me a message directly</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    {isSubmitted ? (
                        <div className="text-center py-12 space-y-4 animate-fadeIn">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Message Sent!</h3>
                            <p className="text-gray-500 dark:text-gray-400">Thanks for reaching out. I'll check it and reply shortly.</p>
                            <Button variant="secondary" onClick={() => setIsSubmitted(false)} className="mt-4">
                                Send Another Message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-muj-orange" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-muj-orange/20 focus:border-muj-orange transition-all bg-gray-50/50 dark:bg-gray-800/50 dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muj-orange" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-muj-orange/20 focus:border-muj-orange transition-all bg-gray-50/50 dark:bg-gray-800/50 dark:text-white"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-muj-orange" /> Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-muj-orange/20 focus:border-muj-orange transition-all bg-gray-50/50 dark:bg-gray-800/50 dark:text-white"
                                    placeholder="Collaboration / Inquiry / Feedback"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-muj-orange/20 focus:border-muj-orange transition-all bg-gray-50/50 dark:bg-gray-800/50 dark:text-white resize-none"
                                    placeholder="Type your message here..."
                                ></textarea>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send Message <Send className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
