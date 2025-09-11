<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewContactMessage extends Notification
{
    use Queueable;

    protected $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nouveau message contact: ' . ($this->payload['subject'] ?? '(no subject)'))
            ->line("From: {$this->payload['name']} <{$this->payload['email']}>")
            ->line($this->payload['message']);
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'contact_message',
            'payload' => $this->payload,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage(['data' => $this->toDatabase($notifiable)]);
    }
}
