<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OrderPlaced extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject("Commande reçue — {$this->order->id}")
            ->greeting("Bonjour {$notifiable->name}")
            ->line("Nous avons reçu votre commande #{$this->order->id}.")
            ->action('Voir la commande', config('frontend.url') . "/orders/{$this->order->id}")
            ->line('Merci pour votre achat !');
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'order_placed',
            'order_id' => $this->order->id,
            'number' => $this->order->id,
            'message' => 'Nouvelle commande reçue.',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'data' => $this->toDatabase($notifiable)
        ]);
    }
}
